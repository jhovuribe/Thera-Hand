#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/ledc.h"
#include "esp_timer.h"

#define SERVO1_GPIO      5
#define SERVO2_GPIO      7
#define SERVO_PWM_FREQ   50
#define SERVO_PWM_RES    LEDC_TIMER_13_BIT
#define SERVO1_CHANNEL   LEDC_CHANNEL_0
#define SERVO2_CHANNEL   LEDC_CHANNEL_1

uint32_t percent_to_duty(float percent) {
    return (uint32_t)((percent / 100.0) * ((1 << 13) - 1));
}

void setup_servo(int gpio, ledc_channel_t channel) {
    ledc_channel_config_t channel_conf = {
        .gpio_num   = gpio,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel    = channel,
        .timer_sel  = LEDC_TIMER_0,
        .duty       = 0,
        .hpoint     = 0
    };
    ledc_channel_config(&channel_conf);
}

void set_servo_position(ledc_channel_t channel, float percent) {
    ledc_set_duty(LEDC_LOW_SPEED_MODE, channel, percent_to_duty(percent));
    ledc_update_duty(LEDC_LOW_SPEED_MODE, channel);
}

void app_main(void) {
    // Set up the timer
    ledc_timer_config_t timer_conf = {
        .speed_mode       = LEDC_LOW_SPEED_MODE,
        .duty_resolution  = SERVO_PWM_RES,
        .timer_num        = LEDC_TIMER_0,
        .freq_hz          = SERVO_PWM_FREQ,
        .clk_cfg          = LEDC_AUTO_CLK
    };
    ledc_timer_config(&timer_conf);

    // Set up both servos
    setup_servo(SERVO1_GPIO, SERVO1_CHANNEL);
    setup_servo(SERVO2_GPIO, SERVO2_CHANNEL);

    int64_t start_time = esp_timer_get_time();  // Microseconds

    while (esp_timer_get_time() - start_time < 20000000) {  // 20 seconds
        // Flex (closed)
        set_servo_position(SERVO1_CHANNEL, 12.4);
        set_servo_position(SERVO2_CHANNEL, 12.4);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // Extend (open)
        set_servo_position(SERVO1_CHANNEL, 2.3);
        set_servo_position(SERVO2_CHANNEL, 2.3);
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    // Stop PWM after 20 seconds
    ledc_stop(LEDC_LOW_SPEED_MODE, SERVO1_CHANNEL, 0);
    ledc_stop(LEDC_LOW_SPEED_MODE, SERVO2_CHANNEL, 0);
}
