# -*- coding: utf-8 -*-

from odoo import api, fields, models


class QuickNote(models.Model):
    """Quick notes for systray widget"""
    _name = 'quick.note'
    _description = 'Quick Note'
    _order = 'is_pinned desc, sequence, write_date desc'

    name = fields.Char(
        string='Title',
        default='New Note',
    )
    content = fields.Text(
        string='Content',
    )
    color = fields.Selection([
        ('yellow', 'Yellow'),
        ('green', 'Green'),
        ('blue', 'Blue'),
        ('pink', 'Pink'),
        ('purple', 'Purple'),
        ('orange', 'Orange'),
    ], string='Color', default='yellow')
    
    is_pinned = fields.Boolean(
        string='Pinned',
        default=False,
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        default=lambda self: self.env.user,
        required=True,
    )
    
    @api.model
    def get_user_notes(self, search_term=''):
        """Get all notes for current user"""
        domain = [('user_id', '=', self.env.user.id)]
        if search_term:
            domain.append('|')
            domain.append(('name', 'ilike', search_term))
            domain.append(('content', 'ilike', search_term))
        
        notes = self.search(domain, order='is_pinned desc, sequence, write_date desc')
        return [{
            'id': note.id,
            'name': note.name,
            'content': note.content or '',
            'color': note.color,
            'is_pinned': note.is_pinned,
            'sequence': note.sequence,
        } for note in notes]
    
    @api.model
    def create_note(self, vals):
        """Create a new note"""
        vals['user_id'] = self.env.user.id
        note = self.create(vals)
        return {
            'id': note.id,
            'name': note.name,
            'content': note.content or '',
            'color': note.color,
            'is_pinned': note.is_pinned,
            'sequence': note.sequence,
        }
    
    def update_note(self, vals):
        """Update a note"""
        self.ensure_one()
        self.write(vals)
        return {
            'id': self.id,
            'name': self.name,
            'content': self.content or '',
            'color': self.color,
            'is_pinned': self.is_pinned,
            'sequence': self.sequence,
        }
    
    def delete_note(self):
        """Delete a note"""
        self.ensure_one()
        self.unlink()
        return True
    
    def toggle_pin(self):
        """Toggle pin status"""
        self.ensure_one()
        self.is_pinned = not self.is_pinned
        return self.is_pinned
