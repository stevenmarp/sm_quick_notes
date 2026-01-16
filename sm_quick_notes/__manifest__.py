# -*- coding: utf-8 -*-
{
    'name': 'SM Quick Notes',
    'version': '18.0.1.0.0',
    'category': 'Productivity',
    'summary': 'Sticky notes widget in systray for quick note-taking',
    'description': """
SM Quick Notes
==============
A sticky notes widget accessible from the systray.

Features:
- Create unlimited notes
- Color-coded notes (yellow, green, blue, pink, purple)
- Pin important notes
- Search notes
- Notes persist in database
- Drag to reorder
- Quick edit inline
    """,
    'author': 'Steven Marp',
    'website': 'https://apps.odoo.com/apps/browse?repo_maintainer_id=512936',
    'license': 'OPL-1',
    'depends': ['web', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/quick_note_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'sm_quick_notes/static/src/components/**/*',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
    'application': True,
    'price': 0.00,
    'currency': 'USD',
}
