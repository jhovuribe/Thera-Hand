// firebase.h
#ifndef FIREBASE_H
#define FIREBASE_H

void upload_rep_header(const char *rep_id, const char *timestamp);
void upload_flex_reading(const char *rep_id, int counter, float flex);

#endif // FIREBASE_H
