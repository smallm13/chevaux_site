# syntax=docker/dockerfile:1.7

############################
# 1️⃣ Composer dependencies
############################
FROM composer:2 AS vendor
WORKDIR /app

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

# Render impose un port dynamique
ENV PORT=10000
ENV APACHE_RUN_PORT=10000

# Installer dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo pdo_mysql zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Configurer Apache pour écouter sur le bon port
RUN sed -i "s/80/${PORT}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

# Copier le projet
COPY . .

# Copier vendor et assets compilés
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

# Permissions Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

# Pointer Apache vers le dossier public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Exposer le port imposé par Render
EXPOSE 10000

CMD ["apache2-foreground"]