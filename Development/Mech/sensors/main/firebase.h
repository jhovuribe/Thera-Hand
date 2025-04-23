#ifndef FIREBASE_H
#define FIREBASE_H

#include <stdbool.h>

extern bool wifi_connected;

extern char session_id[32];

void send_data_to_firestore(float *voltage_array, float *flex_array, int length);

#endif
