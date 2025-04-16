#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/adc.h"
#include "esp_log.h"

#define FLEX_CHANNEL ADC_CHANNEL_0   // GPIO0 = ADC1 channel 0
#define FLEX_WIDTH ADC_WIDTH_BIT_12  // 12-bit resolution (0-4095)

void app_main(void) {
    // Configure ADC
    adc1_config_width(FLEX_WIDTH);
    adc1_config_channel_atten(FLEX_CHANNEL, ADC_ATTEN_DB_11); // for full 0-3.3V range

    while (1) {
        int raw = adc1_get_raw(FLEX_CHANNEL);

        float voltage = (raw / 4095.0f) * 3.3f;

        float Rfixed = 10000.0f; // 10kΩ resistor
        float Rflex = 0.0f;

        if (voltage > 0.0f) {
            Rflex = (3.3f * Rfixed / voltage) - Rfixed;
        }

        ESP_LOGI("FLEX", "Raw: %d | Voltage: %.3f V | Rflex: %.1f Ω", raw, voltage, Rflex);

        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
