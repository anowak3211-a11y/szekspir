"""Standalone Python routes must not retain a password-only MFA bypass."""
import os
import sys
import unittest
import base64
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from api.security import authorised

class AuthenticationTests(unittest.TestCase):
    def test_mfa_machine_scope(self):
        os.environ.update(APP_AUTH_MODE='supabase-mfa',APP_PASSWORD='fixture-password',CRON_SECRET='fixture-machine')
        basic='Basic '+base64.b64encode(b':fixture-password').decode()
        self.assertFalse(authorised({'Authorization':basic}))
        self.assertFalse(authorised({}))
        self.assertTrue(authorised({'Authorization':'Bearer fixture-machine'}))
        del os.environ['CRON_SECRET']
        self.assertFalse(authorised({'Authorization':'Bearer '}))
    def test_unknown_mode_fails_closed(self):
        os.environ.update(APP_AUTH_MODE='typo',APP_PASSWORD='fixture-password')
        self.assertFalse(authorised({'Authorization':'Basic '+base64.b64encode(b':fixture-password').decode()}))

if __name__ == '__main__':
    unittest.main()
