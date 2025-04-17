// offline_storage.c
#include "offline_storage.h"
#include "esp_littlefs.h"
#include "esp_log.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>

extern bool wifi_connected;
void upload_offline_json(const char *rep_id, const char *json);  // defined in firebase.c

static float buffer[100];  // temporary in-memory buffer
static int buffer_len = 0;

void init_spiffs() {
    esp_vfs_littlefs_conf_t conf = {
        .base_path = "/spiffs",
        .partition_label = NULL,
        .format_if_mount_failed = true,
        .dont_mount = false,
    };
    esp_err_t ret = esp_vfs_littlefs_register(&conf);
    if (ret != ESP_OK) {
        ESP_LOGE("LITTLEFS", "Failed to mount or format filesystem");
    } else {
        ESP_LOGI("LITTLEFS", "Filesystem mounted");
    }
}

void append_to_local_buffer(float flex) {
    if (buffer_len < 100) {
        buffer[buffer_len++] = flex;
    }
}

void generate_json_from_buffer(const char *rep_id, const char *timestamp) {
    char json[1024] = {0};
    snprintf(json, sizeof(json), "{\"timestamp\":\"%s\",\"readings\":{", timestamp);

    for (int i = 0; i < buffer_len; i++) {
        char entry[32];
        snprintf(entry, sizeof(entry), "\"value%d\":%.2f%s", i + 1, buffer[i], (i < buffer_len - 1) ? "," : "");
        strncat(json, entry, sizeof(json) - strlen(json) - 1);
    }
    strncat(json, "}}", sizeof(json) - strlen(json) - 1);

    char path[64];
    snprintf(path, sizeof(path), "/spiffs/%s.json", rep_id);
    FILE *f = fopen(path, "w");
    if (f) {
        fprintf(f, "%s", json);
        fclose(f);
        ESP_LOGI("LITTLEFS", "Saved REP session to %s", path);
    }

    buffer_len = 0;
}

void check_and_sync_offline_data() {
    DIR* dir = opendir("/spiffs");
    if (!dir) return;

    struct dirent* entry;
    while ((entry = readdir(dir)) != NULL) {
        char path[64];
        snprintf(path, sizeof(path), "/spiffs/%s", entry->d_name);

        FILE* f = fopen(path, "r");
        if (f) {
            fseek(f, 0, SEEK_END);
            size_t size = ftell(f);
            rewind(f);

            char* json = malloc(size + 1);
            fread(json, 1, size, f);
            json[size] = '\0';
            fclose(f);

            if (wifi_connected) {
                char rep_id[32];
                sscanf(entry->d_name, "%[^.].json", rep_id);
                upload_offline_json(rep_id, json);
                remove(path);
                ESP_LOGI("LITTLEFS", "Uploaded and deleted: %s", path);
            }

            free(json);
        }
    }
    closedir(dir);
}
