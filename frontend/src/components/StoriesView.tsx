import { useState } from 'react';
import { useStore } from '../store';
import { UserStory } from '../types';
import { Plus, CheckCircle2, Circle, Clock, Trash2, Edit3, ChevronRight, Sparkles } from 'lucide-react';

interface StoriesViewProps {
  projectId: string;
  isAdmin: boolean;
}

export const StoriesView = ({ projectId, isAdmin }: StoriesViewProps) => {
  const { projects, addStory, updateStory, deleteStory, updateProject } = useStore();
  const project = projects.find(p => p.id === projectId);
  const stories = project?.stories || [];

  const [isAdding, setIsAdding] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');
  const [newStoryPoints, setNewStoryPoints] = useState<number>(0);
  
  // Brief state
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [briefValue, setBriefValue] = useState(project?.detailedDescription || '');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editPoints, setEditPoints] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;
    addStory(projectId, {
      title: newStoryTitle.trim(),
      description: newStoryDescription.trim(),
      status: 'Backlog',
      points: newStoryPoints
    });
    setNewStoryTitle('');
    setNewStoryDescription('');
    setNewStoryPoints(0);
    setIsAdding(false);
  };

  const toggleStatus = (story: UserStory) => {
    const statuses: UserStory['status'][] = ['Backlog', 'In Progress', 'Review', 'Done'];
    const currentIndex = statuses.indexOf(story.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateStory(projectId, story.id, { status: nextStatus });
  };

  const handleSaveBrief = () => {
    updateProject(projectId, { detailedDescription: briefValue });
    setIsEditingBrief(false);
  };

  // Expanded state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startEditing = (story: UserStory) => {
    setEditingId(story.id);
    setEditValue(story.title);
    setEditPoints(story.points || 0);
    setEditDescription(story.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editValue.trim()) {
      updateStory(projectId, editingId, { 
        title: editValue.trim(),
        points: editPoints,
        description: editDescription.trim()
      });
      setEditingId(null);
    }
  };

  const handleDelete = (storyId: string) => {
    deleteStory(projectId, storyId);
  };

  const toggleExpand = (storyId: string) => {
    setExpandedId(expandedId === storyId ? null : storyId);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Project Brief Section ── */}
      <div className="panel-card rounded-[32px] p-6 mb-10 border-blue-500/20 bg-gradient-to-br from-[var(--bg-darker)] to-[var(--bg-main)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)]">Project Brief & Vision</h3>
          </div>
          {isAdmin && !isEditingBrief && (
            <button 
              onClick={() => setIsEditingBrief(true)}
              className="text-xs font-bold text-blue-500 uppercase tracking-wider hover:underline"
            >
              Edit Brief
            </button>
          )}
        </div>

        {isEditingBrief ? (
          <div className="space-y-4">
            <textarea
              autoFocus
              value={briefValue}
              onChange={e => setBriefValue(e.target.value)}
              placeholder="Describe the detailed vision, technical requirements, and business goals for this project..."
              className="w-full min-h-[160px] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-4 text-sm text-[var(--text-primary)] leading-relaxed outline-none focus:border-blue-500/30"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsEditingBrief(false); setBriefValue(project?.detailedDescription || ''); }}
                className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBrief}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors"
              >
                Save Brief
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] leading-8">
            {project?.detailedDescription || "No detailed project brief provided yet. Define the project's core vision to help the team understand the bigger picture."}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">User Stories</h3>
          <p className="text-sm text-[var(--text-muted)]">Define and manage requirements for {project?.name}.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-sm font-bold hover:bg-blue-600/20 transition-all cursor-pointer"
          >
            <Plus size={18} /> New Story
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddStory} className="bg-[var(--bg-darker)] border border-blue-500/30 rounded-3xl p-6 mb-8 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <div className="space-y-4">
            <input
              autoFocus
              value={newStoryTitle}
              onChange={e => setNewStoryTitle(e.target.value)}
              placeholder="As a [user], I want [goal] so that [benefit]..."
              className="w-full bg-transparent border-none outline-none text-lg font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            
            <div className="h-px bg-[var(--border-color)]" />
            
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Detailed Acceptance Criteria</p>
                <textarea
                  value={newStoryDescription}
                  onChange={e => setNewStoryDescription(e.target.value)}
                  placeholder="Explain technical constraints, UI requirements, or edge cases..."
                  rows={3}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-4 text-sm text-[var(--text-secondary)] outline-none focus:border-blue-500/30"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Points</p>
                <input
                  type="number"
                  value={newStoryPoints}
                  onChange={e => setNewStoryPoints(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-blue-500/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all"
              >
                Create Story
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {stories.map(story => (
          <div key={story.id} className="group flex flex-col bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-2xl transition-all hover:border-[var(--text-muted)] hover:shadow-lg overflow-hidden">
            <div className="p-5 flex items-center gap-4">
              <button 
                onClick={() => toggleStatus(story)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  story.status === 'Done' ? 'bg-green-500 text-white' : 'border-2 border-[var(--border-color)] text-[var(--text-muted)] hover:border-blue-500'
                }`}
              >
                {story.status === 'Done' ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </button>
              
              <div className="flex-1 min-w-0">
                {editingId === story.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    placeholder="Story Title"
                    className="w-full bg-[var(--bg-main)] border border-blue-500/30 rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--text-primary)] outline-none"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Description</p>
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="Add acceptance criteria..."
                        rows={2}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] outline-none resize-none focus:border-blue-500/30"
                      />
                    </div>
                    <div className="w-24">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Points</p>
                      <input
                        type="number"
                        value={editPoints}
                        onChange={e => setEditPoints(parseInt(e.target.value) || 0)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-blue-500/30"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={() => setEditingId(null)} className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Save Story</button>
                  </div>
                </form>
                ) : (
                  <>
                    <h4 
                      onClick={() => toggleExpand(story.id)}
                      className={`text-sm font-bold text-[var(--text-primary)] mb-1 truncate cursor-pointer hover:text-blue-500 transition-colors ${story.status === 'Done' ? 'line-through opacity-50' : ''}`}
                    >
                      {story.title}
                    </h4>
                  </>
                )}
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    story.status === 'Done' ? 'text-green-500' : 
                    story.status === 'In Progress' ? 'text-yellow-500' : 
                    story.status === 'Review' ? 'text-blue-500' : 'text-[var(--text-muted)]'
                  }`}>
                    {story.status === 'In Progress' && <Clock size={10} />}
                    {story.status}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-main)] px-2 py-0.5 rounded-md">
                    {story.points || 0} Points
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEditing(story); }}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(story.id); }}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => toggleExpand(story.id)}
                  className={`p-2 text-[var(--text-muted)] transition-transform duration-200 ${expandedId === story.id ? 'rotate-90 text-blue-500' : ''}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {expandedId === story.id && (
              <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="h-px bg-[var(--border-color)] mb-4" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                  {story.description || "No detailed description provided for this user story yet. Edit the story to add acceptance criteria and technical notes."}
                </p>
                <div className="mt-4 flex gap-4">
                   <div className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Business Value</p>
                      <p className="text-xs font-bold text-[var(--text-primary)]">High</p>
                   </div>
                   <div className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Complexity</p>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{story.points || 0} SP</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {stories.length === 0 && (
          <div className="text-center py-20 bg-[var(--bg-darker)] border-2 border-dashed border-[var(--border-color)] rounded-[32px]">
            <p className="text-[var(--text-muted)] font-medium">No user stories found. Start defining your project requirements!</p>
          </div>
        )}
      </div>
    </div>
  );
};
