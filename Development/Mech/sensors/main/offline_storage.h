// offline_storage.h
#ifndef OFFLINE_STORAGE_H
#define OFFLINE_STORAGE_H

void init_spiffs();
void append_to_local_buffer(float flex);
void generate_json_from_buffer(const char *rep_id, const char *timestamp);
void check_and_sync_offline_data();

#endif // OFFLINE_STORAGE_H