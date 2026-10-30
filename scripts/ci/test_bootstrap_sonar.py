import contextlib
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs

from bootstrap_sonar import generate_temporary_password, main


class SonarBootstrapTest(unittest.TestCase):
    def test_temporary_admin_password_meets_sonarqube_requirements(self):
        password = generate_temporary_password()

        self.assertGreaterEqual(len(password), 12)
        self.assertRegex(password, r'[A-Z]')
        self.assertRegex(password, r'[a-z]')
        self.assertRegex(password, r'\d')
        self.assertRegex(password, r'[^a-zA-Z0-9]')

    def test_refuses_to_modify_an_instance_without_explicit_ci_flag(self):
        with patch.dict(os.environ, {}, clear=True), self.assertRaises(RuntimeError):
            main()

    def test_refuses_remote_server(self):
        with patch.dict(os.environ, {'SONAR_CI_BOOTSTRAP': 'true', 'SONAR_HOST_URL': 'https://sonar.example.test'}, clear=True), self.assertRaises(RuntimeError):
            main()

    def test_provisions_local_instance_and_exports_only_analysis_token(self):
        payloads = [{'status': 'UP'}, {}, {}, {}, {}, {}, {}, {}, {'token': 'temporary-analysis-token'}]
        admin_password = 'Aa1!strong&Pwd'
        responses = [ConnectionResetError('Servidor inicializando')] + [io.BytesIO(json.dumps(payload).encode()) for payload in payloads]
        with tempfile.TemporaryDirectory() as directory:
            environment = Path(directory) / 'github-env'
            with patch.dict(os.environ, {'SONAR_CI_BOOTSTRAP': 'true', 'GITHUB_ENV': str(environment)}, clear=True), \
                 patch('bootstrap_sonar.urlopen', side_effect=responses) as request, \
                 patch('bootstrap_sonar.time.sleep'), \
                 patch('bootstrap_sonar.generate_temporary_password', return_value=admin_password), \
                 contextlib.redirect_stdout(io.StringIO()) as output:
                main()
            self.assertEqual(environment.read_text(), 'SONAR_TOKEN=temporary-analysis-token\n')
            self.assertNotIn(admin_password, output.getvalue())
            self.assertIn('::add-mask::temporary-analysis-token', output.getvalue())
            urls = [call.args[0].full_url for call in request.call_args_list]
            self.assertIn('http://127.0.0.1:9000/api/qualitygates/select', urls)
            password_request = next(call.args[0] for call in request.call_args_list if call.args[0].full_url.endswith('/api/users/change_password'))
            self.assertEqual(parse_qs(password_request.data.decode()), {
                'login': ['admin'], 'previousPassword': ['admin'], 'password': [admin_password]
            })
            conditions = [parse_qs(call.args[0].data.decode()) for call in request.call_args_list if call.args[0].full_url.endswith('/create_condition')]
            self.assertEqual({item['metric'][0] for item in conditions}, {'line_coverage', 'bugs', 'vulnerabilities'})
            condition = next(call.args[0] for call in request.call_args_list if call.args[0].full_url.endswith('/create_condition'))
            self.assertEqual(parse_qs(condition.data.decode()), {
                'gateName': ['Oficina CI - cobertura 90'], 'metric': ['line_coverage'], 'op': ['LT'], 'error': ['90']
            })


if __name__ == '__main__':
    unittest.main()
