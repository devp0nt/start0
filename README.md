# Initialize db

$ psql
create database "svagatron";
create user "svagatron" with encrypted password 'svagatron';
grant all privileges on database "svagatron" to "svagatron";
alter user "svagatron" createdb;
alter database "svagatron" owner to "svagatron";
create database "svagatron-test";
create user "svagatron-test" with encrypted password 'svagatron-test';
grant all privileges on database "svagatron-test" to "svagatron-test";
alter user "svagatron-test" createdb;
alter database "svagatron-test" owner to "svagatron-test";

# Heroku logs to Datadog

$ heroku stack:set container --app x

$ heroku drains:add 'https://http-intake.logs.datadoghq.eu/api/v2/logs/?dd-api-key=<DD_API_KEY>&ddsource=heroku&env=production&service=<HEROKU_APP_NAME>&host=<HOST_ENV>' -a <HEROKU_APP_NAME>
