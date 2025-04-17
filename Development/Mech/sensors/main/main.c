#include <stdio.h>
#include <math.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"

#define FLEX_CHANNEL ADC_CHANNEL_0
#define FLEX_WIDTH ADC_WIDTH_BIT_12
#define SAMPLE_COUNT 10
#define RUN_DURATION_SEC 120
#define SAMPLE_INTERVAL_MS 50
#define MAX_ITERATIONS (RUN_DURATION_SEC * 1000 / SAMPLE_INTERVAL_MS)

void app_main(void) {
    adc1_config_width(FLEX_WIDTH);
    adc1_config_channel_atten(FLEX_CHANNEL, ADC_ATTEN_DB_11);

    const float min_voltage = 0.25f;
    const float max_voltage = 1.2f;

    float readings[SAMPLE_COUNT] = {0};
    int sample_index = 0;
    int iteration = 0;

    while (iteration < MAX_ITERATIONS) {
        // 1. Get current reading
        int raw = adc1_get_raw(FLEX_CHANNEL);
        float voltage = (raw / 4095.0f) * 3.3f;

        // 2. Save to circular buffer
        readings[sample_index] = voltage;
        sample_index++;

        if (sample_index >= SAMPLE_COUNT) {
            // 3. Calculate mean
            float sum = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) {
                sum += readings[i];
            }
            float mean = sum / SAMPLE_COUNT;

            // 4. Calculate standard deviation
            float variance = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) {
                variance += powf(readings[i] - mean, 2);
            }
            variance /= SAMPLE_COUNT;
            float std_dev = sqrtf(variance);

            // 5. Filter outliers and re-average
            float filtered_sum = 0.0f;
            int count = 0;
            for (int i = 0; i < SAMPLE_COUNT; i++) {
                if (fabsf(readings[i] - mean) <= std_dev) {
                    filtered_sum += readings[i];
                    count++;
                }
            }

            float avg_voltage = (count > 0) ? filtered_sum / count : mean;

            // 6. Scale to 0-100
            float flex_percent = 0.0f;
            if (avg_voltage >= min_voltage) {
                flex_percent = ((avg_voltage - min_voltage) / (max_voltage - min_voltage)) * 100.0f;
                if (flex_percent > 100.0f) flex_percent = 100.0f;
            }

            ESP_LOGI("FLEX", "Avg Voltage: %.3f V | Flex: %.1f%%", avg_voltage, flex_percent);

            // Reset for next batch
            sample_index = 0;
        }

        iteration++;
        vTaskDelay(pdMS_TO_TICKS(SAMPLE_INTERVAL_MS));
    }

    ESP_LOGI("FLEX", "Data collection complete. Duration: %d seconds", RUN_DURATION_SEC);
}
