import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ROUTES } from '../navigation/routes';

interface VocabTag {
    id: number;
    name: string;
    category: string;
    description: string | null;
    examples: string | null;
}

interface TagManagementPageProps {
    onNavigate?: (route: string) => void;
}

/**
 * Admin page for managing vocabulary semantic tags.
 * Provides CRUD operations for the Language Coach tag system.
 */
export function TagManagementPage({ onNavigate }: TagManagementPageProps) {
    const [tags, setTags] = useState<VocabTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTag, setEditingTag] = useState<VocabTag | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'semantic',
        description: '',
        examples: '',
    });

    // Load tags on mount
    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/vocab-tags');
            if (!response.ok) throw new Error('Failed to load tags');
            const data = await response.json();
            setTags(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tags');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/vocab-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to create tag');
            await loadTags();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create tag');
        }
    };

    const handleUpdate = async () => {
        if (!editingTag) return;
        try {
            const response = await fetch(`/api/vocab-tags/${editingTag.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to update tag');
            await loadTags();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update tag');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this tag?')) return;
        try {
            const response = await fetch(`/api/vocab-tags/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete tag');
            await loadTags();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tag');
        }
    };

    const handleSeedDefaults = async () => {
        try {
            const response = await fetch('/api/vocab-tags/seed-defaults', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to seed defaults');
            await loadTags();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to seed defaults');
        }
    };

    const startEdit = (tag: VocabTag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            category: tag.category,
            description: tag.description || '',
            examples: tag.examples || '',
        });
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setEditingTag(null);
        setFormData({ name: '', category: 'semantic', description: '', examples: '' });
        setIsFormOpen(false);
    };

    const categoryColors: Record<string, string> = {
        semantic: 'bg-blue-100 text-blue-700',
        grammar_role: 'bg-purple-100 text-purple-700',
        pos: 'bg-green-100 text-green-700',
    };

    return (
        <div className="min-h-screen theme-bg">
            <Navbar onBack={() => onNavigate?.(ROUTES.HOME)} />

            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold theme-text">Tag Management</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSeedDefaults}
                            className="px-4 py-2 border-2 border-black text-black font-bold rounded-lg"
                        >
                            Seed Defaults
                        </button>
                        <button
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            className="px-4 py-2 bg-black text-white font-bold rounded-lg"
                        >
                            + New Tag
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
                    </div>
                )}

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="mb-6 p-4 border-2 border-black rounded-lg theme-surface">
                        <h2 className="text-lg font-bold mb-4">
                            {editingTag ? 'Edit Tag' : 'New Tag'}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g., transport"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="semantic">Semantic</option>
                                    <option value="grammar_role">Grammar Role</option>
                                    <option value="pos">Part of Speech</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g., Vehicles and transportation"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Examples (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.examples}
                                    onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g., 車, バス, 電車"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={editingTag ? handleUpdate : handleCreate}
                                className="px-4 py-2 bg-black text-white font-bold rounded-lg"
                            >
                                {editingTag ? 'Update' : 'Create'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Tags Table */}
                {isLoading ? (
                    <div className="text-center py-8 theme-text-muted">Loading tags...</div>
                ) : tags.length === 0 ? (
                    <div className="text-center py-8 theme-text-muted">
                        No tags yet. Click "Seed Defaults" to add N5 tags.
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Examples</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tags.map((tag) => (
                                    <tr key={tag.id} className="theme-surface">
                                        <td className="px-4 py-3 font-medium">{tag.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[tag.category] || 'bg-gray-100'}`}>
                                                {tag.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{tag.description || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{tag.examples || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => startEdit(tag)}
                                                className="px-2 py-1 text-sm text-blue-600 mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                className="px-2 py-1 text-sm text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
