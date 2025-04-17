#include "firebase.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include <string.h>

#define FIREBASE_URL "https://thera-hand-default-rtdb.firebaseio.com/"
static const char *TAG = "FIREBASE";

esp_err_t _http_event_handler(esp_http_client_event_t *evt) {
    return ESP_OK;
}

void upload_rep_header(const char *rep_id, const char *timestamp) {
    char url[256];
    snprintf(url, sizeof(url), "%s/REP/%s.json", FIREBASE_URL, rep_id);

    char json_data[128];
    snprintf(json_data, sizeof(json_data), "{\"timestamp\":\"%s\"}", timestamp);

    esp_http_client_config_t config = {
        .url = url,
        .event_handler = _http_event_handler,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_method(client, HTTP_METHOD_PATCH);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, json_data, strlen(json_data));
    esp_http_client_perform(client);
    esp_http_client_cleanup(client);

    ESP_LOGI(TAG, "Uploaded REP header for %s", rep_id);
}

void upload_flex_reading(const char *rep_id, int counter, float flex) {
    char url[256];
    snprintf(url, sizeof(url), "%s/REP/%s/readings/value%d.json", FIREBASE_URL, rep_id, counter);

    char data[32];
    snprintf(data, sizeof(data), "%.2f", flex);

    esp_http_client_config_t config = {
        .url = url,
        .event_handler = _http_event_handler,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_method(client, HTTP_METHOD_PUT);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, data, strlen(data));
    esp_http_client_perform(client);
    esp_http_client_cleanup(client);

    ESP_LOGI(TAG, "Uploaded flex reading %d: %.2f", counter, flex);
}

void upload_offline_json(const char *rep_id, const char *json) {
    char url[256];
    snprintf(url, sizeof(url), "%s/REP/%s.json", FIREBASE_URL, rep_id);

    esp_http_client_config_t config = {
        .url = url,
        .event_handler = _http_event_handler,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_method(client, HTTP_METHOD_PATCH);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, json, strlen(json));
    esp_http_client_perform(client);
    esp_http_client_cleanup(client);

    ESP_LOGI(TAG, "Uploaded offline JSON for %s", rep_id);
}
