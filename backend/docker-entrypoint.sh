#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    postgres://*|postgresql://*)
      stripped=${DATABASE_URL#*://}
      userinfo=${stripped%%@*}
      rest=${stripped#*@}
      user=${userinfo%%:*}
      pass=${userinfo#*:}
      hostport=${rest%%/*}
      dbpart=${rest#*/}
      db=${dbpart%%\?*}
      qs=${dbpart#"$db"}
      host=${hostport%%:*}
      case "$hostport" in
        *:*) port=${hostport##*:} ;;
        *) port=5432 ;;
      esac
      case "$host" in
        *.*) ;;
        *) host="${host}.oregon-postgres.render.com" ;;
      esac
      jdbc="jdbc:postgresql://${host}:${port}/${db}"
      if [ -n "$qs" ]; then
        jdbc="${jdbc}${qs}"
      fi
      case "$jdbc" in
        *sslmode=*) ;;
        *\?*) jdbc="${jdbc}&sslmode=require" ;;
        *) jdbc="${jdbc}?sslmode=require" ;;
      esac
      export SPRING_DATASOURCE_URL="$jdbc"
      export SPRING_DATASOURCE_USERNAME="$user"
      export SPRING_DATASOURCE_PASSWORD="$pass"
      ;;
  esac
fi

exec java -jar /app/app.jar
