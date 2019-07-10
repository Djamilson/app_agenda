#!/bin/sh
# Filename: gencert.sh
# Description: This script generates x509 server certificate (with all IPs in
#              SAN) signed by a self-signed CA.
# Version: 1.6 - 2018 December 27
# Author: Andrey Arapov <andrey.arapov@nixaid.com>
# License: GPLv3

#================================
# execultar o arquivo $./gencert.sh --cn ofertadodia.palmas.br
#================================

ME=$(printf '%s\n' "${0##*/}")

print_help() {
  printf "[${ME}] HELP: I accept following arguments:
  --help      - show this message
  --cn        - certificate's CN name\t\t(MANDATORY)
  --key       - server key name\t\t\t(default: private.key)
  --cert      - server cert name\t\t\t(default: public.crt)
  --days      - server cert expiration in days\t(default: 365)
  --cakey     - CA key name\t\t\t(default: ca.key)
  --ca        - CA cert name\t\t\t(default: ca.crt)
  --cadays    - CA cert expiration in days\t(default: 3650)\n
  --noautosan - do not automatically discover IPs for SAN records\n
  --san-ip    - specify custom SAN IP records manually. Implies --noautosan\n
  --san-dns   - specify custom SAN DNS records manually.\n
  --debug     - show extra information\n
  --rsa       - generate RSA keys instead of ECDSA\n
  --rsa-size  - set RSA key size\n"
}

#  Parse command line arguments
##

parse_arguments() {
  # A POSIX variable
  OPTIND=1 # Reset in case getopts has been used previously in the shell.

  # read arguments
  opts=$(getopt \
      --longoptions "help,cn:,key:,cert:,days:,cakey:,ca:,cadays:,noautosan,san-ip:,san-dns:,debug,rsa,rsa-size:" \
      --name "$(basename "$0")" \
      --options "" \
      -- "$@"
  )

  eval set --$opts

  while [ $# -gt 0 ]; do
    case "$1" in
      --help)
        print_help;
        exit 0
        ;;

      --cn)
        ARG_CN=$2
        shift 2
        ;;

      --key)
        ARG_KEY=$2
        shift 2
        ;;

      --cert)
        ARG_CERT=$2
        shift 2
        ;;

      --days)
        ARG_DAYS=$2
        shift 2
        ;;

      --cakey)
        ARG_CAKEY=$2
        shift 2
        ;;

      --ca)
        ARG_CA=$2
        shift 2
        ;;

      --cadays)
        ARG_CADAYS=$2
        shift 2
        ;;

      --noautosan)
        ARG_NOAUTOSAN=1
        shift 1
        ;;

      --san-ip)
        ARG_NOAUTOSAN=1
        ARG_SAN_IP=$2
        shift 2
        ;;

      --san-dns)
        ARG_SAN_DNS=$2
        shift 2
        ;;

      --debug)
        ARG_DEBUG=1
        shift 1
        ;;

      --rsa)
        ARG_RSA=1
        shift 1
        ;;

      --rsa-size)
        ARG_RSA_SIZE=$2
        shift 2
        ;;

      *)
        break
        ;;
    esac
  done

  #  prepare common variables
  ##

  OPENSSL_CONFIG="openssl.cnf"
  CN="${ARG_CN}"
  CA_KEY="${ARG_CAKEY:-ca.key}"
  CA_CERT="${ARG_CA:-ca.crt}"
  CA_DAYS="${ARG_CADAYS:-3650}"
  SERVER_KEY="${ARG_KEY:-private.key}"
  SERVER_CERT="${ARG_CERT:-public.crt}"
  DAYS="${ARG_DAYS:-365}"
  NOAUTOSAN="${ARG_NOAUTOSAN}"
  SAN_IP="${ARG_SAN_IP}"
  SAN_DNS="${ARG_SAN_DNS}"
  DEBUG="${ARG_DEBUG}"
  RSA="${ARG_RSA}"
  RSA_SIZE="${ARG_RSA_SIZE:-2048}"

  if [ -z "${CN}" ]; then
    echo "[${ME}] ERROR: Please specify CN, example \"--cn ofertadodia.palmas.br\""
    print_help;
    exit 1
  fi

  # For debugging purposes
  if [ "${DEBUG}" -eq 1 ]; then
    echo CN=$CN
    echo KEY=$KEY
    echo CERT=$CERT
    echo DAYS=$DAYS
    echo CAKEY=$CAKEY
    echo CA=$CA
    echo CADAYS=$CADAYS
    echo NOAUTOSAN=$NOAUTOSAN
    echo SAN_IP=$SAN_IP
    echo SAN_DNS=$SAN_DNS
    echo DEBUG=$DEBUG
    echo RSA=$RSA
    echo RSA_SIZE=$RSA_SIZE
  fi
}

#  install openssl
##

has_openssl() {
  type openssl >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    return;
  fi

  if [ $(id -u) -ne 0 ]; then
     echo "This script must be run as root in order to install openssl package."
     echo "If you cannot run this script as root, then make sure you have the openssl package."
     exit 1
  fi

  if [ -f /etc/debian_version ]; then
    echo "[${ME}] Installing openssl in Debian/Ubuntu"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get -y install openssl
  elif [ -f /etc/alpine-release ]; then
    echo "[${ME}] Installing openssl in Alpine"
    apk add --update openssl
  elif [ -f /etc/centos-release ]; then
    echo "[${ME}] Installing openssl in CentOS"
    yum -y install openssl
  fi

  type openssl >/dev/null
  if [ $? -ne 0 ]; then
    echo "[${ME}] ERROR: Could not install openssl. Exitting."
    exit 1
  fi
}

#  install getopt
##

has_getopt() {
  type getopt >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    return;
  fi

  if [ $(id -u) -ne 0 ]; then
     echo "This script must be run as root in order to install getopt tool."
     echo "If you cannot run this script as root, then make sure you have the getopt tool."
     exit 1
  fi

  if [ -f /etc/debian_version ]; then
    echo "[${ME}] Installing getopt in Debian/Ubuntu"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get -y install util-linux
  elif [ -f /etc/alpine-release ]; then
    echo "[${ME}] Installing getopt in Alpine"
    apk add --update busybox
    ln -sv $(type -p busybox) /usr/bin/getopt
  elif [ -f /etc/centos-release ]; then
    echo "[${ME}] Installing getopt in CentOS"
    yum -y install util-linux
  fi

  type getopt >/dev/null
  if [ $? -ne 0 ]; then
    echo "[${ME}] ERROR: Could not install getopt. Exitting."
    exit 1
  fi
}

#  generate openssl config
##

gen_openssl_config() {
  OPENSSL_CONFIG_CONTENT="[ req ]
distinguished_name = req_distinguished_name
[req_distinguished_name]
[ v3_ca ]
basicConstraints = critical, CA:TRUE
keyUsage = critical, digitalSignature, keyEncipherment, keyCertSign
[ v3_req_server ]
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[ alt_names ]
DNS.1=${CN}"

  if [ ! -z "$SAN_IP" ]; then
    echo "[${ME}] Using user-provided SAN records: " ${SAN_IP}
    i=1
    IFS=,
    PAYLOAD="$(for IP in $SAN_IP; do echo "IP.${i} = ${IP}" ; i=$((i + 1)); done)"
    unset IFS
  fi
  if [ ! -z "$SAN_DNS" ]; then
    echo "[${ME}] Using user-provided SAN records: " ${SAN_DNS}
    i=1
    IFS=,
    PAYLOAD="${PAYLOAD}\n$(for DNS in $SAN_DNS; do echo "DNS.${i} = ${DNS}" ; i=$((i + 1)); done)"
    unset IFS
  fi
  if [ -z "$NOAUTOSAN" ]; then
    # Gather IPs for SAN

    i=1
    IPS="$( (getent ahostsv4 $(hostname) 2>/dev/null || getent hosts $(hostname) 2>/dev/null) | awk '{print $1}' |sort | uniq)"

    echo "[${ME}] Found these IPs: " ${IPS}
    PAYLOAD="${PAYLOAD}\n$(for IP in $IPS; do echo "IP.${i} = ${IP}" ; i=$((i + 1)); done)"
  fi

  printf "${OPENSSL_CONFIG_CONTENT}\n${PAYLOAD}\n" > "${OPENSSL_CONFIG}"
}

#  generate CA certificate
##

gen_ca() {
  echo "[${ME}] Generating new CA: ${CA_KEY} / ${CA_CERT} ..."
  if [ -z "${RSA}" ]; then
    openssl ecparam -name prime256v1 -genkey -noout -out "${CA_KEY}"
  else
    openssl genrsa -out "${CA_KEY}" "${RSA_SIZE}"
  fi
  chmod 0600 "${CA_KEY}"
  openssl req -x509 -new -sha256 -nodes -key "${CA_KEY}" -days "${CA_DAYS}" -out "${CA_CERT}" \
              -subj "/CN=my-CA"  -extensions v3_ca -config "${OPENSSL_CONFIG}"
}

#  generate server certificate
##

gen_server_x509() {
  echo "[${ME}] Generating new server x509: ${SERVER_KEY} / ${SERVER_CERT} ..."
  if [ -z "${RSA}" ]; then
    openssl ecparam -name prime256v1 -genkey -noout -out "${SERVER_KEY}"
  else
    openssl genrsa -out "${SERVER_KEY}" "${RSA_SIZE}"
  fi
  chmod 0600 "${SERVER_KEY}"
  openssl req -new -sha256 -key "${SERVER_KEY}" -subj "/CN=${CN}" \
    | openssl x509 -req -sha256 -CA "${CA_CERT}" -CAkey "${CA_KEY}" -CAcreateserial \
                   -out ${SERVER_CERT} -days "${DAYS}" \
                   -extensions v3_req_server -extfile "${OPENSSL_CONFIG}"
}

start() {
  echo "[${ME}] Started in ${PWD} directory."

  has_getopt;
  has_openssl;

  parse_arguments "$@";

  gen_openssl_config;

  if [ ! -f "${CA_KEY}" ]; then
    echo "[${ME}] Could not find ${CA_KEY} file so I will generate a new one."
    gen_ca;
  fi

  openssl x509 -in "${CA_CERT}" -noout -checkend 2592000 >/dev/null
  if [ $? -ne 0 ]; then
    echo "[${ME}] WARNING! Your CA certificate will expire in less than 30 days."
  fi

  openssl x509 -in "${CA_CERT}" -noout -checkend 1 >/dev/null
  if [ $? -ne 0 ]; then
    echo "[${ME}] WARNING! Your CA certificate has expired, so we will generate a new one."
    gen_ca;
  fi

  # Generate a new server certificate with the detected IPs.
  gen_server_x509;

  echo "[${ME}] The certificates have been generated in ${PWD} directory."

  CERT_INFO="$(openssl x509 -in "${SERVER_CERT}" -noout -text)"
  echo "${CERT_INFO}" | grep -E "CN=|DNS:|IP Address|Not\ "
}

#  script starts here
##

start "$@";
