#include "wifi.h"
#include "time_sync.h"
#include "firebase.h"
#include "offline_storage.h"
#include "nvs_flash.h"
#include <stdio.h>
#include <math.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"

#define FLEX_CHANNEL ADC_CHANNEL_0
#define FLEX_WIDTH ADC_WIDTH_BIT_12
#define SAMPLE_COUNT 10
#define SAMPLE_INTERVAL_MS 500
#define RUN_DURATION_SEC 60
#define MAX_ITERATIONS (RUN_DURATION_SEC * 1000 / SAMPLE_INTERVAL_MS)

extern bool wifi_connected;

void app_main(void) {
    nvs_flash_init();
    wifi_init();
    init_spiffs();
    sync_time();

    if (wifi_connected) {
        check_and_sync_offline_data();
    }

    char timestamp[32];
    char rep_id[64];
    generate_rep_id_and_timestamp(rep_id, sizeof(rep_id), timestamp, sizeof(timestamp));
    upload_rep_header(rep_id, timestamp);

    adc1_config_width(FLEX_WIDTH);
    adc1_config_channel_atten(FLEX_CHANNEL, ADC_ATTEN_DB_11);

    float readings[SAMPLE_COUNT] = {0};
    int sample_index = 0;
    int iteration = 0;
    int value_counter = 1;

    const float min_voltage = 0.25f;
    const float max_voltage = 1.2f;

    while (iteration < MAX_ITERATIONS) {
        int raw = adc1_get_raw(FLEX_CHANNEL);
        float voltage = (raw / 4095.0f) * 3.3f;
        readings[sample_index++] = voltage;

        if (sample_index >= SAMPLE_COUNT) {
            float sum = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) sum += readings[i];
            float mean = sum / SAMPLE_COUNT;

            float variance = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++)
                variance += powf(readings[i] - mean, 2);
            variance /= SAMPLE_COUNT;
            float std_dev = sqrtf(variance);

            float filtered_sum = 0.0f;
            int count = 0;
            for (int i = 0; i < SAMPLE_COUNT; i++) {
                if (fabsf(readings[i] - mean) <= std_dev) {
                    filtered_sum += readings[i];
                    count++;
                }
            }

            float avg_voltage = (count > 0) ? filtered_sum / count : mean;

            float flex_percent = 0.0f;
            if (avg_voltage >= min_voltage) {
                flex_percent = ((avg_voltage - min_voltage) / (max_voltage - min_voltage)) * 100.0f;
                if (flex_percent > 100.0f) flex_percent = 100.0f;
            }

            ESP_LOGI("FLEX", "Avg Voltage: %.3f V | Flex: %.1f%%", avg_voltage, flex_percent);

            if (wifi_connected) {
                upload_flex_reading(rep_id, value_counter++, flex_percent);
            } else {
                append_to_local_buffer(flex_percent);
            }

            sample_index = 0;
        }

        iteration++;
        vTaskDelay(pdMS_TO_TICKS(SAMPLE_INTERVAL_MS));
    }

    if (!wifi_connected) {
        generate_json_from_buffer(rep_id, timestamp);
    }

    ESP_LOGI("FLEX", "Data collection complete. Duration: %d seconds", RUN_DURATION_SEC);
}
