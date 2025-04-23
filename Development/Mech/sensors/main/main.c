#include <stdio.h>
#include <math.h>
#include <string.h>
#include <time.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"
#include "esp_sntp.h"
#include "wifi.h"
#include "firebase.h"

extern bool wifi_connected;

#define FLEX_CHANNEL ADC_CHANNEL_0
#define FLEX_WIDTH ADC_WIDTH_BIT_12
#define SAMPLE_COUNT 10
#define RUN_DURATION_SEC 10
#define SAMPLE_INTERVAL_MS 50
#define MAX_ITERATIONS (RUN_DURATION_SEC * 1000 / SAMPLE_INTERVAL_MS)

#define WIFI_RETRY_COUNT 5

void wait_for_wifi() {
    int retries = 0;
    while (!wifi_connected && retries < WIFI_RETRY_COUNT) {
        ESP_LOGW("WIFI", "Waiting for Wi-Fi connection... (%d/%d)", retries + 1, WIFI_RETRY_COUNT);
        vTaskDelay(pdMS_TO_TICKS(2000));
        retries++;
    }

    if (wifi_connected) {
        ESP_LOGI("WIFI", "Wi-Fi connected successfully.");
    } else {
        ESP_LOGE("WIFI", "Failed to connect to Wi-Fi after %d attempts. Halting program.", WIFI_RETRY_COUNT);
        while (1) {
            vTaskDelay(portMAX_DELAY);  // halt
        }
    }
}


char session_id[32];  // Global session timestamp
float voltage_log[MAX_ITERATIONS];     // Store all voltage readings
float flex_log[MAX_ITERATIONS];        // Store all flex percent readings

void initialize_sntp(void) {
    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setservername(0, "pool.ntp.org");
    sntp_init();
}

void wait_for_time_sync() {
    time_t now = 0;
    struct tm timeinfo = {0};
    int retry = 0;
    const int retry_count = 10;

    while (timeinfo.tm_year < (2023 - 1900) && ++retry < retry_count) {
        ESP_LOGI("TIME", "Waiting for time sync... (%d/%d)", retry, retry_count);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
        time(&now);
        localtime_r(&now, &timeinfo);
    }
}

void app_main(void) {
    wifi_init_sta();

    // Wait for Wi-Fi connection
    int retries = 0;
    const int max_retries = 10;
    while (!wifi_connected && retries < max_retries) {
        ESP_LOGI("WIFI", "Waiting for Wi-Fi... (%d/%d)", retries + 1, max_retries);
        vTaskDelay(pdMS_TO_TICKS(1000));
        retries++;
    }
    if (!wifi_connected) {
        ESP_LOGE("WIFI", "Failed to connect to Wi-Fi after %d attempts", max_retries);
        return;
    }
    ESP_LOGI("WIFI", "Connected to Wi-Fi!");

    //wait_for_wifi(); // NEW

    initialize_sntp();
    wait_for_time_sync();

    // Generate session ID
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo);
    strftime(session_id, sizeof(session_id), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    ESP_LOGI("SESSION", "Session started: %s", session_id);

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

        readings[sample_index++] = voltage;

        if (sample_index >= SAMPLE_COUNT) {
            float sum = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) sum += readings[i];
            float mean = sum / SAMPLE_COUNT;

            float variance = 0.0f;
            for (int i = 0; i < SAMPLE_COUNT; i++) {
                variance += powf(readings[i] - mean, 2);
            }
            float std_dev = sqrtf(variance / SAMPLE_COUNT);

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

            ESP_LOGI("FLEX", "Voltage: %.3f V | Flex: %.1f%%", avg_voltage, flex_percent);

            voltage_log[iteration] = avg_voltage;
            flex_log[iteration] = flex_percent;

            sample_index = 0;
        }

        iteration++;
        vTaskDelay(pdMS_TO_TICKS(SAMPLE_INTERVAL_MS));
    }

    ESP_LOGI("FLEX", "Session complete. Sending data to Firestore...");

    if (wifi_connected) {
        send_data_to_firestore(voltage_log, flex_log, iteration);  // Only send after full session
    }

    ESP_LOGI("FLEX", "Data upload complete.");
}
