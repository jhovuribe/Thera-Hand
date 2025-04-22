idf_component_register(SRCS
  "main.c"
  "wifi.c"
  "firebase.c"
  INCLUDE_DIRS "."
  REQUIRES esp_wifi esp_event esp_netif esp_http_client nvs_flash driver
)
