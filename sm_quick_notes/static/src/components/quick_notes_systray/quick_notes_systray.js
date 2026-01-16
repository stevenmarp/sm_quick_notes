/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

class QuickNotesSystray extends Component {
    static template = "sm_quick_notes.QuickNotesSystray";
    static components = { Dropdown, DropdownItem };
    static props = {};

    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");
        
        this.state = useState({
            notes: [],
            searchTerm: '',
            editingNoteId: null,
            isLoading: false,
            showColorPicker: null,
        });
        
        this.colors = [
            { name: 'yellow', hex: '#fff9c4' },
            { name: 'green', hex: '#c8e6c9' },
            { name: 'blue', hex: '#bbdefb' },
            { name: 'pink', hex: '#f8bbd9' },
            { name: 'purple', hex: '#e1bee7' },
            { name: 'orange', hex: '#ffe0b2' },
        ];
        
        onWillStart(async () => {
            await this.loadNotes();
        });
    }

    async loadNotes() {
        this.state.isLoading = true;
        try {
            this.state.notes = await this.orm.call(
                'quick.note',
                'get_user_notes',
                [this.state.searchTerm]
            );
        } catch (e) {
            console.error('Failed to load notes:', e);
        }
        this.state.isLoading = false;
    }

    async onSearchChange(ev) {
        this.state.searchTerm = ev.target.value;
        await this.loadNotes();
    }

    async createNote() {
        try {
            const newNote = await this.orm.call(
                'quick.note',
                'create_note',
                [{ name: 'New Note', content: '', color: 'yellow' }]
            );
            this.state.notes.unshift(newNote);
            this.state.editingNoteId = newNote.id;
        } catch (e) {
            this.notification.add('Failed to create note', { type: 'danger' });
        }
    }

    async updateNote(noteId, field, value) {
        const note = this.state.notes.find(n => n.id === noteId);
        if (!note) return;
        
        note[field] = value;
        
        try {
            await this.orm.call(
                'quick.note',
                'update_note',
                [noteId, { [field]: value }]
            );
        } catch (e) {
            console.error('Failed to update note:', e);
        }
    }

    async deleteNote(noteId) {
        try {
            await this.orm.call('quick.note', 'delete_note', [noteId]);
            this.state.notes = this.state.notes.filter(n => n.id !== noteId);
            this.notification.add('Note deleted', { type: 'success' });
        } catch (e) {
            this.notification.add('Failed to delete note', { type: 'danger' });
        }
    }

    async togglePin(noteId) {
        const note = this.state.notes.find(n => n.id === noteId);
        if (!note) return;
        
        try {
            const isPinned = await this.orm.call('quick.note', 'toggle_pin', [noteId]);
            note.is_pinned = isPinned;
            // Re-sort notes
            this.state.notes.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
                return 0;
            });
        } catch (e) {
            console.error('Failed to toggle pin:', e);
        }
    }

    setColor(noteId, color) {
        this.updateNote(noteId, 'color', color);
        this.state.showColorPicker = null;
    }

    toggleColorPicker(noteId, ev) {
        ev.stopPropagation();
        this.state.showColorPicker = this.state.showColorPicker === noteId ? null : noteId;
    }

    getColorHex(colorName) {
        const color = this.colors.find(c => c.name === colorName);
        return color ? color.hex : '#fff9c4';
    }

    startEditing(noteId) {
        this.state.editingNoteId = noteId;
    }

    stopEditing() {
        this.state.editingNoteId = null;
    }

    onTitleChange(noteId, ev) {
        this.updateNote(noteId, 'name', ev.target.value);
    }

    onContentChange(noteId, ev) {
        this.updateNote(noteId, 'content', ev.target.value);
    }

    get pinnedCount() {
        return this.state.notes.filter(n => n.is_pinned).length;
    }

    get noteCount() {
        return this.state.notes.length;
    }
}

registry.category("systray").add("sm_quick_notes.QuickNotesSystray", {
    Component: QuickNotesSystray,
}, { sequence: 45 });

export default QuickNotesSystray;
