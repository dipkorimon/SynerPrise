# Database configuration storing engine and port for easy switching
DATABASES_CONFIG = {
    "mysql": {
        "ENGINE": "django.db.backends.mysql",
        "PORT": "3306",
    },
    "postgres": {
        "ENGINE": "django.db.backends.postgresql",
        "PORT": "5432",
    }
}

SELECTED_DB = "postgres"

DATABASES = {
    "default": {
        "ENGINE": DATABASES_CONFIG[SELECTED_DB]["ENGINE"],
        "NAME": "synerprise",
        "USER": "postgres",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": DATABASES_CONFIG[SELECTED_DB]["PORT"],
    }
}