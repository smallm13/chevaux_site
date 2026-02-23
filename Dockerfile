# syntax=docker/dockerfile:1.7

############################
# 1️⃣ Composer dependencies
############################
FROM php:8.4-cli AS vendor
WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-scripts \
    --optimize-autoloader

############################
# 2️⃣ Build frontend assets
############################
FROM node:20-alpine AS assets
WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY resources ./resources
COPY public ./public
COPY vite.config.js ./

RUN npm run build

############################
# 3️⃣ PHP + Apache
############################
FROM php:8.2-apache AS app
WORKDIR /var/www/html

ENV PORT=10000
ENV APACHE_RUN_PORT=10000
ENV SESSION_DRIVER=file

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite \
    && echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i "s/80/${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

# Copier le projet (inclut public/css et public/js statiques)
COPY . .

# Écraser avec vendor et assets compilés
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public ./public

# Permissions Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

EXPOSE 10000

CMD ["sh", "-lc", "export SESSION_DRIVER=file; php artisan config:clear && php artisan cache:clear && (php artisan migrate --force || true); apache2-foreground"]