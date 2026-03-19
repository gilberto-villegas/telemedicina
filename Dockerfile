FROM php:8.3-fpm

# ==================== CONFIGURACIÓN DEV ====================
ENV APP_ENV=local
ENV APP_DEBUG=true
ENV PHP_IDE_CONFIG="serverName=Docker"

# ==================== HERRAMIENTAS Y DEPENDENCIAS ====================
# 1. Actualizar e instalar herramientas + dependencias de extensiones
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    nano \
    vim \
    htop \
    iputils-ping \
    net-tools \
    # DEPENDENCIAS CRÍTICAS para extensiones PHP:
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ==================== EXTENSIONES PHP ====================
# 2. Configurar GD primero (necesita configuración especial)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg

# 3. Instalar extensiones PHP principales
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache \
    sockets

# 4. XDebug para debugging
RUN pecl install xdebug && docker-php-ext-enable xdebug

# Configurar XDebug
RUN echo "xdebug.mode=develop,debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# 5. Redis (opcional, pero útil)
RUN pecl install redis && docker-php-ext-enable redis

# ==================== COMPOSER ====================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ==================== DIRECTORIO Y CÓDIGO ====================
WORKDIR /var/www/html

# Copiar todo el código primero
COPY . .

# Instalar dependencias (sin scripts que requieren artisan)
RUN composer install --optimize-autoloader --no-interaction --no-scripts || true
RUN composer dump-autoload --optimize

# ==================== PERMISOS ====================
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 777 /var/www/html/storage \
    && chmod -R 777 /var/www/html/bootstrap/cache

# ==================== CONFIGURACIÓN PHP ====================
RUN echo 'memory_limit = 256M' >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini && \
    echo 'max_execution_time = 300' >> /usr/local/etc/php/conf.d/docker-php-timeout.ini && \
    echo 'date.timezone = America/Caracas' >> /usr/local/etc/php/conf.d/docker-php-timezone.ini

# ==================== EXPOSE Y CMD ====================
EXPOSE 8000 9003

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]