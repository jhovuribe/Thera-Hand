#include "firebase.h"
#include "esp_log.h"
#include "esp_err.h"
#include "esp_http_client.h"
#include <string.h>
#include <stdio.h>

#define TAG "FIREBASE"

extern char session_id[32];  // defined in main.c
bool wifi_connected = false; // updated from wifi.c

void send_data_to_firebase(float voltage, float flex_percent, const char *timestamp) {
    if (!wifi_connected) {
        ESP_LOGW(TAG, "Wi-Fi not connected. Skipping upload.");
        return;
    }

    // Correctly construct the full Firebase path
    char firebase_url[256];
    snprintf(firebase_url, sizeof(firebase_url),
             "https://thera-hand-default-rtdb.firebaseio.com/sessions/%s/%s.json",
             session_id, timestamp);

    // JSON body
    char post_data[128];
    snprintf(post_data, sizeof(post_data),
             "{\"voltage\": %.3f, \"flex_percent\": %.2f}",
             voltage, flex_percent);

    // Setup HTTP config
    esp_http_client_config_t config = {
        .url = firebase_url,
        .method = HTTP_METHOD_PUT,  // Use PUT so data is written under the timestamp key
        .timeout_ms = 5000,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, post_data, strlen(post_data));

    // Perform request
    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "Data sent to Firebase: %s", post_data);
    } else {
        ESP_LOGE(TAG, "HTTP PUT failed: %s", esp_err_to_name(err));
    }

    esp_http_client_cleanup(client);
}
