idf_component_register(SRCS
  "main.c"
  "wifi.c"
  "firebase.c"
  INCLUDE_DIRS "."
  REQUIRES esp_wifi esp_event esp_netif esp_http_client nvs_flash driver
)

# This must come AFTER idf_component_register
target_add_binary_data(${COMPONENT_LIB} "firebase_cert.pem.txt" TEXT)
