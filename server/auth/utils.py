from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six
from pybloom_live import BloomFilter


class TokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.is_active)
        )

password_reset_token = TokenGenerator()


class EmailActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) + six.text_type(user.is_active)
        )

email_activation_token = EmailActivationTokenGenerator()


class PasswordResetToken(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return six.text_type(user.pk) + six.text_type(timestamp) + six.text_type(user.is_active)

password_reset_token = PasswordResetToken()


# Initialize a Bloom Filter for username existence checks
# capacity=10000: maximum expected usernames to store
# error_rate=0.01: 1% false positive probability
username_bloom = BloomFilter(capacity=10000, error_rate=0.01)
email_bloom = BloomFilter(capacity=100000, error_rate=0.01)