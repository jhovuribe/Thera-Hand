#include "firebase.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include <string.h>
#include <stdio.h>

#define TAG "FIREBASE"
#define FIREBASE_API_KEY "AIzaSyCZsGIY0DhOQ5qzWyINa0hWMYYed43P7pw"
#define FIREBASE_PROJECT_ID "thera-hand"

extern char session_id[32];

void send_data_to_firestore(float *voltage_array, float *flex_array, int length) {
    char post_url[256];
    snprintf(post_url, sizeof(post_url),
             "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/CLIENT_1/Sessions/%s?key=%s",
             FIREBASE_PROJECT_ID, session_id, FIREBASE_API_KEY);

    // Format JSON payload
    char payload[2048];
    strcpy(payload, "{ \"fields\": { \"voltage\": { \"arrayValue\": { \"values\": [");

    for (int i = 0; i < length; i++) {
        char entry[32];
        snprintf(entry, sizeof(entry), "{ \"doubleValue\": %.3f }%s",
                 voltage_array[i], (i < length - 1) ? "," : "");
        strncat(payload, entry, sizeof(payload) - strlen(payload) - 1);
    }

    strcat(payload, "] } }, \"flex_percent\": { \"arrayValue\": { \"values\": [");

    for (int i = 0; i < length; i++) {
        char entry[32];
        snprintf(entry, sizeof(entry), "{ \"doubleValue\": %.2f }%s",
                 flex_array[i], (i < length - 1) ? "," : "");
        strncat(payload, entry, sizeof(payload) - strlen(payload) - 1);
    }

    strcat(payload, "] } } } }");

    esp_http_client_config_t config = {
        .url = post_url,
        .method = HTTP_METHOD_PATCH,
        .timeout_ms = 8000,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, payload, strlen(payload));

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "Successfully uploaded session data to Firestore.");
    } else {
        ESP_LOGE(TAG, "Failed to upload session data: %s", esp_err_to_name(err));
    }

    esp_http_client_cleanup(client);
}
