// time_sync.c
#include "time_sync.h"
#include "esp_sntp.h"
#include "esp_log.h"
#include <time.h>

static const char *TAG = "TIME";

void sync_time() {
    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setservername(0, "pool.ntp.org");
    sntp_init();

    time_t now = 0;
    struct tm timeinfo = {0};
    int retry = 0;
    while (timeinfo.tm_year < (2016 - 1900) && ++retry < 10) {
        time(&now);
        localtime_r(&now, &timeinfo);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }

    if (timeinfo.tm_year >= (2016 - 1900)) {
        ESP_LOGI(TAG, "Time synced: %s", asctime(&timeinfo));
    } else {
        ESP_LOGW(TAG, "Failed to sync time");
    }
}

void generate_rep_id_and_timestamp(char *rep_id_buf, int rep_buf_size, char *timestamp_buf, int time_buf_size) {
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo);

    strftime(timestamp_buf, time_buf_size, "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    snprintf(rep_id_buf, rep_buf_size, "REP_%04d%02d%02d_%02d%02d%02d",
             timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
             timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
}
