idf_component_register(SRCS
    "main.c"
    "wifi.c"
    "firebase.c"
    "offline_storage.c"
    "time_sync.c"
    INCLUDE_DIRS "."
    REQUIRES nvs_flash esp_http_client esp_wifi esp_event esp_netif esp_littlefs
)
