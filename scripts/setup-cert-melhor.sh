#!/bin/sh


SCRIPT_HOME=$(cd "$(dirname "${0}")/../certs" && pwd)
echo "${SCRIPT_HOME}"

certdir="tls"
host="localhost"

# setup a CA key
if [ ! -f "${SCRIPT_HOME}/ca-key.pem" ]; then
  openssl genrsa -out "${SCRIPT_HOME}/ca-key.pem" 4096
fi

# setup a CA cert
openssl req -new -x509 -days 365 \
  -subj "/CN=Local CA" \
  -key "${SCRIPT_HOME}/ca-key.pem" \
  -sha256 -out "${SCRIPT_HOME}/ca.pem"

# setup a host key
if [ ! -f "${SCRIPT_HOME}/key.pem" ]; then
  openssl genrsa -out "${SCRIPT_HOME}/key.pem" 2048
fi

# create a signing request
extfile="${SCRIPT_HOME}/extfile"
openssl req -subj "/CN=${host}" -new -key "${SCRIPT_HOME}/key.pem" \
   -out "${SCRIPT_HOME}/${host}.csr"
echo "subjectAltName = IP:127.0.0.1,DNS:localhost" >${extfile}

# create the host cert
openssl x509 -req -days 365 \
   -in "${SCRIPT_HOME}/${host}.csr" -extfile "${SCRIPT_HOME}/extfile" \
   -CA "${SCRIPT_HOME}/ca.pem" -CAkey "${SCRIPT_HOME}/ca-key.pem" -CAcreateserial \
   -out "${SCRIPT_HOME}/cert.pem"

# cleanup
if [ -f "${SCRIPT_HOME}/${host}.csr" ]; then
        rm -f -- "${SCRIPT_HOME}/${host}.csr"
fi
if [ -f "${extfile}" ]; then
        rm -f -- "${extfile}"
fi

