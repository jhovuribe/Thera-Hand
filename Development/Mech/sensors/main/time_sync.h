// time_sync.h
#ifndef TIME_SYNC_H
#define TIME_SYNC_H

void sync_time();
void generate_rep_id_and_timestamp(char *rep_id_buf, int rep_buf_size, char *timestamp_buf, int time_buf_size);

#endif // TIME_SYNC_H
