<?php
// Copy to private_html/sunshine-mail.php, outside the public web root.
// Set enabled=true only after Elastic Email is bound to this server and a test email is received.
return [
    'enabled' => false,
    'from_email' => '', // A sender on a domain verified in Cloudways Elastic Email.
    'to_email' => 'erika.byrd3@gmail.com',
    'allowed_hosts' => [
        'phpstack-1564285-6705359.cloudwaysapps.com',
        'sunshinesmilesacademy.com',
        'www.sunshinesmilesacademy.com',
    ],
];
