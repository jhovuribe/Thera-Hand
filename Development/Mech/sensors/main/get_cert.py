import ssl
import socket

hostname = 'firestore.googleapis.com'
port = 443

context = ssl.create_default_context()
conn = context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=hostname)
conn.connect((hostname, port))

cert = ssl.DER_cert_to_PEM_cert(conn.getpeercert(True))
with open("firebase_cert.pem", "w") as f:
    f.write(cert)

print("Certificate saved as firebase_cert.pem")
