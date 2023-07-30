create table if not exists communication_emails
(
    json             json not null,
    id               varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    body             text as (json_unquote(json_extract(`json`, _utf8mb4'$.body'))),
    body_plain       text as (json_unquote(json_extract(`json`, _utf8mb4'$.body_plain'))),
    user_id          varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.user_id'))) stored,
    email_address_id varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.email_address_id'))) stored comment 'The ID of the recipient''s email address in the `emails` table',
    to_email_address varchar(320) as (json_unquote(json_extract(`json`, _utf8mb4'$.to_email_address')))
);

create index user_id
    on communication_emails (user_id);

create table if not exists communication_sms
(
    json              json not null,
    id                varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    from_phone_number varchar(30) as (json_unquote(json_extract(`json`, _utf8mb4'$.from_phone_number'))),
    user_id           varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.user_id'))) stored,
    phone_number_id   varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.phone_number_id'))) comment 'The ID of the recipient''s phone number',
    to_phone_number   varchar(320) as (json_unquote(json_extract(`json`, _utf8mb4'$.to_phone_number'))),
    message           text as (json_unquote(json_extract(`json`, _utf8mb4'$.message')))
);

create index user_id
    on communication_sms (user_id);

create table if not exists contracts
(
    id          bigint unsigned auto_increment
        primary key,
    is_deleted  tinyint(1)   default 0                 not null,
    user_id     varchar(191) default ''                not null,
    title       varchar(191) default ''                not null,
    price       decimal(9, 2)                          not null,
    description varchar(750) default ''                null,
    features    json                                   null,
    created_at  timestamp    default CURRENT_TIMESTAMP not null,
    updated_at  timestamp    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint id
        unique (id)
);

create index user_id
    on contracts (user_id);

create table if not exists emails
(
    json          json         null,
    user_id       varchar(191) not null,
    id            varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    email_address varchar(320) as (json_unquote(json_extract(`json`, _utf8mb4'$.email_address'))) stored,
    verification  varchar(25) as (json_unquote(json_extract(`json`, _utf8mb4'$.verification.status')))
);

create table if not exists external_accounts
(
    json    json         null,
    user_id varchar(191) not null,
    id      varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key
);

create table if not exists organization_invitations
(
    id              varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    json            json not null,
    created_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.created_at'))),
    status          enum ('revoked', 'accepted', 'pending') as (json_unquote(json_extract(`json`, _utf8mb4'$.status'))),
    updated_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.updated_at'))),
    organization_id varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.organization_id'))) stored,
    email_address   varchar(320) as (json_unquote(json_extract(`json`, _utf8mb4'$.email_address'))) stored,
    role            varchar(25) as (json_unquote(json_extract(`json`, _utf8mb4'$.role')))
);

create table if not exists organization_memberships
(
    json            json not null,
    id              varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    created_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.created_at'))),
    updated_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.updated_at'))),
    user_id         varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.public_user_data.user_id'))) stored,
    role            varchar(25) as (json_unquote(json_extract(`json`, _utf8mb4'$.role'))),
    organization_id varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.organization.id'))) stored
);

create index organization_id
    on organization_memberships (organization_id);

create index user_id
    on organization_memberships (user_id);

create table if not exists organization_memberships_archive
(
    id         bigint unsigned auto_increment
        primary key,
    json       json                                not null,
    deleted_at timestamp default CURRENT_TIMESTAMP not null,
    constraint id
        unique (id)
);

create table if not exists organizations
(
    id              varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    json            json not null,
    created_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.created_at'))),
    created_by      varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.created_by'))) stored,
    image_url       text as (json_unquote(json_extract(`json`, _utf8mb4'$.image_url'))),
    name            varchar(255) as (json_unquote(json_extract(`json`, _utf8mb4'$.name'))) stored,
    public_metadata json as (json_unquote(json_extract(`json`, _utf8mb4'$.public_metadata'))),
    updated_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.updated_at'))),
    slug            varchar(365) as (json_unquote(json_extract(`json`, _utf8mb4'$.slug')))
);

create index created_by
    on organizations (created_by);

create table if not exists organizations_archive
(
    id         bigint unsigned auto_increment,
    json       json                                not null,
    deleted_at timestamp default CURRENT_TIMESTAMP not null,
    constraint id
        unique (id)
);

create table if not exists sessions
(
    json           json not null,
    id             varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    client_id      varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.client_id'))),
    user_id        varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.user_id'))) stored,
    abandon_at     bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.abandon_at'))),
    created_at     bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.created_at'))),
    updated_at     bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.updated_at'))),
    last_active_at bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.last_active_at'))),
    expire_at      bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.expire_at'))),
    status         enum ('active', 'removed', 'ended', 'revoked') as (json_unquote(json_extract(`json`, _utf8mb4'$.status')))
);

create index user_id
    on sessions (user_id);

create table if not exists users
(
    json                     json not null,
    id                       varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.id'))) stored
        primary key,
    created_at               bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.created_at'))),
    updated_at               bigint as (json_unquote(json_extract(`json`, _utf8mb4'$.updated_at'))),
    first_name               varchar(255) as (json_unquote(json_extract(`json`, _utf8mb4'$.first_name'))),
    last_name                varchar(255) as (json_unquote(json_extract(`json`, _utf8mb4'$.last_name'))),
    private_metadata         json as (json_unquote(json_extract(`json`, _utf8mb4'$.private_metadata'))),
    public_metadata          json as (json_unquote(json_extract(`json`, _utf8mb4'$.public_metadata'))),
    primary_email_address_id varchar(191) as (json_unquote(json_extract(`json`, _utf8mb4'$.primary_email_address_id'))),
    image_url                text as (json_unquote(json_extract(`json`, _utf8mb4'$.image_url')))
);

create table if not exists users_archive
(
    id         bigint unsigned auto_increment
        primary key,
    json       json                                null,
    deleted_at timestamp default CURRENT_TIMESTAMP not null,
    constraint id
        unique (id)
);

