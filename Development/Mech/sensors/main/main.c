#include <stdio.h>
#include <math.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"
#include "wifi.h"
#include "firebase.h"

#include <time.h>
#include <sys/time.h>
#include "esp_sntp.h"

#define FLEX_CHANNEL ADC_CHANNEL_0
#define FLEX_WIDTH ADC_WIDTH_BIT_12
#define SAMPLE_COUNT 10
#define RUN_DURATION_SEC 120
#define SAMPLE_INTERVAL_MS 50
#define MAX_ITERATIONS (RUN_DURATION_SEC * 1000 / SAMPLE_INTERVAL_MS)

char session_id[32];  // Define it globally


void initialize_sntp(void) {
    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setservername(0, "pool.ntp.org"); // NTP server
    sntp_init();
}

void wait_for_time_sync() {
    time_t now = 0;
    struct tm timeinfo = { 0 };
    int retry = 0;
    const int retry_count = 10;

    while (timeinfo.tm_year < (2023 - 1900) && ++retry < retry_count) {
        ESP_LOGI("TIME", "Waiting for system time to be set... (%d/%d)", retry, retry_count);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
        time(&now);
        localtime_r(&now, &timeinfo);
    }
}

void app_main(void) {
    wifi_init_sta();  // Connect to Wi-Fi
    initialize_sntp();
    wait_for_time_sync();

    time_t now;
    time(&now);
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);
    strftime(session_id, sizeof(session_id), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    ESP_LOGI("SESSION", "Session started at: %s", session_id);


    adc1_config_width(FLEX_WIDTH);
    adc1_config_channel_atten(FLEX_CHANNEL, ADC_ATTEN_DB_11);

    const float min_voltage = 0.25f;
    const float max_voltage = 1.2f;

    float readings[SAMPLE_COUNT] = {0};
    int sample_index = 0;
    int iteration = 0;

    while (iteration < MAX_ITERATIONS) {
        int raw = adc1_get_raw(FLEX_CHANNEL);
        float voltage = (raw / 4095.0f) * 3.3f;

        readings[sample_index] = voltage;
        sample_index++;

        if (sample_index >= SAMPLE_COUNT) {
            float sum = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) sum += readings[i];
            float mean = sum / SAMPLE_COUNT;

            float variance = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) {
                variance += powf(readings[i] - mean, 2);
            }
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
                char iso_time[32];
                time_t now;
                time(&now);
                struct tm timeinfo;
                localtime_r(&now, &timeinfo);
                strftime(iso_time, sizeof(iso_time), "%Y-%m-%dT%H:%M:%S", &timeinfo);

                send_data_to_firebase(avg_voltage, flex_percent, iso_time);

            }

            sample_index = 0;
        }

        iteration++;
        vTaskDelay(pdMS_TO_TICKS(SAMPLE_INTERVAL_MS));
    }

    ESP_LOGI("FLEX", "Data collection complete. Duration: %d seconds", RUN_DURATION_SEC);
}
