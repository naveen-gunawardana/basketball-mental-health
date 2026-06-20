"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft, Plus, Pencil, Trash2, X, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp, GraduationCap, ListVideo, Clock, Video,
} from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  level: string | null;
  category: string | null;
  sport: string | null;
  instructor: string | null;
  cover_url: string | null;
  status: string;
  sort_order: number;
}

interface Lesson {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  video_url: string | null;
  duration: string | null;
  content: string | null;
  sort_order: number;
}

type CourseStatus = "draft" | "published";

interface CourseForm {
  id: string | null;
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: string;
  category: string;
  sport: string;
  instructor: string;
  cover_url: string;
  status: CourseStatus;
  sort_order: string;
}

interface LessonForm {
  id: string | null;
  course_id: string;
  title: string;
  slug: string;
  video_url: string;
  duration: string;
  content: string;
  sort_order: string;
}

const EMPTY_COURSE: CourseForm = {
  id: null,
  title: "",
  slug: "",
  summary: "",
  description: "",
  level: "Beginner",
  category: "",
  sport: "",
  instructor: "",
  cover_url: "",
  status: "published",
  sort_order: "0",
};

function emptyLesson(courseId: string): LessonForm {
  return {
    id: null,
    course_id: courseId,
    title: "",
    slug: "",
    video_url: "",
    duration: "",
    content: "",
    sort_order: "0",
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-sage-100 text-sage-700 border-sage-200",
  draft: "bg-navy/8 text-navy/60 border-navy/10",
};

const inputClass =
  "w-full rounded-sm border border-offWhite-400 bg-white px-3 py-2 text-sm text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-navy/45 mb-1.5";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Course form
  const [courseForm, setCourseForm] = useState<CourseForm | null>(null);
  const [courseSlugEdited, setCourseSlugEdited] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [confirmDeleteCourseId, setConfirmDeleteCourseId] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Lessons
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonForm | null>(null);
  const [lessonSlugEdited, setLessonSlugEdited] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      setMessage({ type: "error", text: `Failed to load courses: ${error.message}` });
      setLoading(false);
      return;
    }

    setCourses((data ?? []) as unknown as Course[]);

    // Tally lesson counts per course
    const { data: lessonData } = await supabase.from("lessons").select("course_id");
    const counts = new Map<string, number>();
    for (const row of (lessonData ?? []) as { course_id: string }[]) {
      counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
    }
    setLessonCounts(counts);

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ---------- Course form helpers ----------
  function openNewCourse() {
    const nextOrder = courses.length > 0 ? Math.max(...courses.map((c) => c.sort_order)) + 1 : 0;
    setCourseForm({ ...EMPTY_COURSE, sort_order: String(nextOrder) });
    setCourseSlugEdited(false);
    setMessage(null);
  }

  function openEditCourse(c: Course) {
    setCourseForm({
      id: c.id,
      title: c.title,
      slug: c.slug,
      summary: c.summary ?? "",
      description: c.description ?? "",
      level: c.level ?? "",
      category: c.category ?? "",
      sport: c.sport ?? "",
      instructor: c.instructor ?? "",
      cover_url: c.cover_url ?? "",
      status: (c.status === "draft" ? "draft" : "published") as CourseStatus,
      sort_order: String(c.sort_order ?? 0),
    });
    setCourseSlugEdited(true);
    setMessage(null);
  }

  function closeCourseForm() {
    setCourseForm(null);
    setCourseSlugEdited(false);
  }

  function updateCourseField<K extends keyof CourseForm>(key: K, value: CourseForm[K]) {
    setCourseForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function onCourseTitleChange(value: string) {
    setCourseForm((prev) => {
      if (!prev) return prev;
      return { ...prev, title: value, slug: courseSlugEdited ? prev.slug : slugify(value) };
    });
  }

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseForm || savingCourse) return;

    if (!courseForm.title.trim()) { setMessage({ type: "error", text: "Course title is required." }); return; }
    if (!courseForm.slug.trim()) { setMessage({ type: "error", text: "Course slug is required." }); return; }

    setSavingCourse(true);
    setMessage(null);
    const supabase = createClient();

    const orderParsed = parseInt(courseForm.sort_order, 10);

    const payload = {
      title: courseForm.title.trim(),
      slug: slugify(courseForm.slug),
      summary: courseForm.summary.trim() || null,
      description: courseForm.description.trim() || null,
      level: courseForm.level.trim() || null,
      category: courseForm.category.trim() || null,
      sport: courseForm.sport.trim() || null,
      instructor: courseForm.instructor.trim() || null,
      cover_url: courseForm.cover_url.trim() || null,
      status: courseForm.status,
      sort_order: Number.isNaN(orderParsed) ? 0 : orderParsed,
    };

    let errMsg: string | null = null;
    if (courseForm.id) {
      const { error } = await supabase.from("courses").update(payload).eq("id", courseForm.id);
      errMsg = error?.message ?? null;
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      errMsg = error?.message ?? null;
    }

    setSavingCourse(false);

    if (errMsg) {
      setMessage({ type: "error", text: `Could not save course: ${errMsg}` });
      return;
    }

    setMessage({ type: "success", text: courseForm.id ? "Course updated." : "Course created." });
    closeCourseForm();
    await load();
  }

  async function handleDeleteCourse(id: string) {
    setDeletingCourseId(id);
    const supabase = createClient();
    const { error } = await supabase.from("courses").delete().eq("id", id);
    setDeletingCourseId(null);
    setConfirmDeleteCourseId(null);

    if (error) {
      setMessage({ type: "error", text: `Could not delete course: ${error.message}` });
      return;
    }
    setMessage({ type: "success", text: "Course deleted." });
    if (expandedCourseId === id) { setExpandedCourseId(null); setLessons([]); }
    if (courseForm?.id === id) closeCourseForm();
    await load();
  }

  // ---------- Lessons ----------
  async function loadLessons(courseId: string) {
    setLessonsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });
    if (error) {
      setMessage({ type: "error", text: `Failed to load lessons: ${error.message}` });
    }
    setLessons((data ?? []) as unknown as Lesson[]);
    setLessonsLoading(false);
  }

  async function toggleLessons(courseId: string) {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      setLessons([]);
      setLessonForm(null);
      return;
    }
    setExpandedCourseId(courseId);
    setLessons([]);
    setLessonForm(null);
    await loadLessons(courseId);
  }

  function openNewLesson(courseId: string) {
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map((l) => l.sort_order)) + 1 : 0;
    setLessonForm({ ...emptyLesson(courseId), sort_order: String(nextOrder) });
    setLessonSlugEdited(false);
    setMessage(null);
  }

  function openEditLesson(l: Lesson) {
    setLessonForm({
      id: l.id,
      course_id: l.course_id,
      title: l.title,
      slug: l.slug,
      video_url: l.video_url ?? "",
      duration: l.duration ?? "",
      content: l.content ?? "",
      sort_order: String(l.sort_order ?? 0),
    });
    setLessonSlugEdited(true);
    setMessage(null);
  }

  function closeLessonForm() {
    setLessonForm(null);
    setLessonSlugEdited(false);
  }

  function updateLessonField<K extends keyof LessonForm>(key: K, value: LessonForm[K]) {
    setLessonForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function onLessonTitleChange(value: string) {
    setLessonForm((prev) => {
      if (!prev) return prev;
      return { ...prev, title: value, slug: lessonSlugEdited ? prev.slug : slugify(value) };
    });
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonForm || savingLesson) return;

    if (!lessonForm.title.trim()) { setMessage({ type: "error", text: "Lesson title is required." }); return; }
    if (!lessonForm.slug.trim()) { setMessage({ type: "error", text: "Lesson slug is required." }); return; }

    setSavingLesson(true);
    setMessage(null);
    const supabase = createClient();

    const orderParsed = parseInt(lessonForm.sort_order, 10);

    const payload = {
      course_id: lessonForm.course_id,
      title: lessonForm.title.trim(),
      slug: slugify(lessonForm.slug),
      video_url: lessonForm.video_url.trim() || null,
      duration: lessonForm.duration.trim() || null,
      content: lessonForm.content.trim() || null,
      sort_order: Number.isNaN(orderParsed) ? 0 : orderParsed,
    };

    let errMsg: string | null = null;
    if (lessonForm.id) {
      const { error } = await supabase.from("lessons").update(payload).eq("id", lessonForm.id);
      errMsg = error?.message ?? null;
    } else {
      const { error } = await supabase.from("lessons").insert(payload);
      errMsg = error?.message ?? null;
    }

    setSavingLesson(false);

    if (errMsg) {
      setMessage({ type: "error", text: `Could not save lesson: ${errMsg}` });
      return;
    }

    setMessage({ type: "success", text: lessonForm.id ? "Lesson updated." : "Lesson created." });
    const courseId = lessonForm.course_id;
    closeLessonForm();
    await loadLessons(courseId);
    await load();
  }

  async function handleDeleteLesson(id: string) {
    setDeletingLessonId(id);
    const supabase = createClient();
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    setDeletingLessonId(null);
    setConfirmDeleteLessonId(null);

    if (error) {
      setMessage({ type: "error", text: `Could not delete lesson: ${error.message}` });
      return;
    }
    setMessage({ type: "success", text: "Lesson deleted." });
    if (lessonForm?.id === id) closeLessonForm();
    if (expandedCourseId) await loadLessons(expandedCourseId);
    await load();
  }

  const deletingCourse = courses.find((c) => c.id === confirmDeleteCourseId);
  const deletingLesson = lessons.find((l) => l.id === confirmDeleteLessonId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>
      </div>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy">Courses</h1>
          <p className="text-xs text-muted-foreground">{courses.length} total · manage training courses &amp; lessons</p>
        </div>
        <button
          type="button"
          onClick={courseForm && courseForm.id === null ? closeCourseForm : openNewCourse}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 px-5 py-2.5 text-sm font-bold text-white transition-colors rounded-sm"
        >
          {courseForm && courseForm.id === null ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New course</>}
        </button>
      </div>

      {/* Inline message */}
      {message && (
        <div
          className={`mb-6 flex items-start gap-2 rounded-sm border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-sage-200 bg-sage-50 text-sage-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss" className="text-current/60 hover:text-current">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Course form panel */}
      {courseForm && (
        <form onSubmit={handleSaveCourse} className="mb-8 rounded-sm border border-offWhite-300 bg-offWhite p-6">
          <h2 className="text-base font-bold text-navy mb-4">{courseForm.id ? "Edit course" : "New course"}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input type="text" value={courseForm.title} onChange={(e) => onCourseTitleChange(e.target.value)} className={inputClass} placeholder="Building unshakeable confidence" required />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={courseForm.slug}
                onChange={(e) => { setCourseSlugEdited(true); updateCourseField("slug", e.target.value); }}
                className={inputClass}
                placeholder="building-unshakeable-confidence"
                required
              />
              <p className="mt-1 text-[11px] text-navy/40">Auto-generated from title. Editable.</p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Summary</label>
              <input type="text" value={courseForm.summary} onChange={(e) => updateCourseField("summary", e.target.value)} className={inputClass} placeholder="One-line hook shown on the course card" />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description (markdown)</label>
              <textarea value={courseForm.description} onChange={(e) => updateCourseField("description", e.target.value)} rows={5} className={`${inputClass} resize-y font-mono text-xs leading-relaxed`} placeholder="What this course covers, who it's for, what athletes will walk away with…" />
            </div>

            <div>
              <label className={labelClass}>Level</label>
              <input list="course-levels" type="text" value={courseForm.level} onChange={(e) => updateCourseField("level", e.target.value)} className={inputClass} placeholder="Beginner / Intermediate / Advanced" />
              <datalist id="course-levels">
                <option value="Beginner" />
                <option value="Intermediate" />
                <option value="Advanced" />
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input type="text" value={courseForm.category} onChange={(e) => updateCourseField("category", e.target.value)} className={inputClass} placeholder="Mental / Strength / Conditioning / Skills" />
            </div>

            <div>
              <label className={labelClass}>Sport</label>
              <input type="text" value={courseForm.sport} onChange={(e) => updateCourseField("sport", e.target.value)} className={inputClass} placeholder="Basketball / General" />
            </div>
            <div>
              <label className={labelClass}>Instructor</label>
              <input type="text" value={courseForm.instructor} onChange={(e) => updateCourseField("instructor", e.target.value)} className={inputClass} placeholder="Jordan Reyes" />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Cover image URL (optional)</label>
              <input type="url" value={courseForm.cover_url} onChange={(e) => updateCourseField("cover_url", e.target.value)} className={inputClass} placeholder="https://…" />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select value={courseForm.status} onChange={(e) => updateCourseField("status", e.target.value as CourseStatus)} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input type="number" value={courseForm.sort_order} onChange={(e) => updateCourseField("sort_order", e.target.value)} className={inputClass} placeholder="0" />
              <p className="mt-1 text-[11px] text-navy/40">Lower numbers appear first.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={savingCourse} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 px-6 py-2.5 text-sm font-bold text-white transition-colors rounded-sm">
              {savingCourse ? "Saving…" : courseForm.id ? "Save changes" : "Create course"}
            </button>
            <button type="button" onClick={closeCourseForm} className="rounded-sm border border-offWhite-300 px-4 py-2.5 text-sm font-medium text-navy hover:bg-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete course confirmation overlay */}
      {confirmDeleteCourseId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-navy mb-2">Delete course?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently delete{" "}
              <span className="font-medium text-navy">{deletingCourse?.title ?? "this course"}</span>{" "}
              and all of its lessons. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmDeleteCourseId(null)} className="rounded-sm border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => handleDeleteCourse(confirmDeleteCourseId)} disabled={deletingCourseId === confirmDeleteCourseId} className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingCourseId === confirmDeleteCourseId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete lesson confirmation overlay */}
      {confirmDeleteLessonId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-navy mb-2">Delete lesson?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently delete{" "}
              <span className="font-medium text-navy">{deletingLesson?.title ?? "this lesson"}</span>. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmDeleteLessonId(null)} className="rounded-sm border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => handleDeleteLesson(confirmDeleteLessonId)} disabled={deletingLessonId === confirmDeleteLessonId} className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingLessonId === confirmDeleteLessonId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-navy/40 text-sm">Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="rounded-sm border border-dashed border-offWhite-400 bg-offWhite p-10 text-center">
          <GraduationCap className="h-8 w-8 text-navy/20 mx-auto mb-3" />
          <p className="text-navy/55 text-sm mb-1 font-medium">No courses yet.</p>
          <p className="text-navy/40 text-xs">Create your first course, then add lessons to it.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => {
            const count = lessonCounts.get(c.id) ?? 0;
            const expanded = expandedCourseId === c.id;
            return (
              <div key={c.id} className="rounded-sm border border-offWhite-300 bg-white">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[c.status] ?? "bg-navy/8 text-navy/60 border-navy/10"}`}>
                          {c.status}
                        </span>
                        {c.level && <span className="rounded-sm px-2 py-0.5 text-[11px] font-medium bg-orange-50 text-orange-600">{c.level}</span>}
                        {c.category && <span className="rounded-sm px-2 py-0.5 text-[11px] font-medium bg-navy/8 text-navy">{c.category}</span>}
                        {c.sport && <span className="rounded-sm px-2 py-0.5 text-[11px] font-medium bg-navy/8 text-navy">{c.sport}</span>}
                      </div>
                      <h3 className="text-sm font-bold text-navy leading-snug">{c.title}</h3>
                      {c.summary && <p className="text-xs text-navy/55 mt-1 leading-relaxed">{c.summary}</p>}
                      <p className="text-xs text-navy/45 mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <ListVideo className="h-3 w-3" />
                        <span className="font-semibold text-navy/70">{count}</span> lesson{count !== 1 ? "s" : ""}
                        {c.instructor ? <span className="text-navy/40">· {c.instructor}</span> : null}
                        <span className="text-navy/30">·</span>
                        <span className="text-navy/40">/{c.slug}</span>
                        <span className="text-navy/30">·</span>
                        <span className="text-navy/40">order {c.sort_order}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => toggleLessons(c.id)} className="inline-flex items-center gap-1 rounded-sm border border-offWhite-300 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                        <ListVideo className="h-3.5 w-3.5" /> Lessons {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => openEditCourse(c)} className="inline-flex items-center gap-1 rounded-sm border border-offWhite-300 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteCourseId(c.id)} className="inline-flex items-center gap-1 rounded-sm border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lessons panel */}
                {expanded && (
                  <div className="border-t border-offWhite-300 bg-offWhite px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy/45">
                        Lessons{lessonsLoading ? "" : ` · ${lessons.length}`}
                      </p>
                      <button
                        type="button"
                        onClick={lessonForm && lessonForm.id === null && lessonForm.course_id === c.id ? closeLessonForm : () => openNewLesson(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/80 transition-colors"
                      >
                        {lessonForm && lessonForm.id === null && lessonForm.course_id === c.id
                          ? <><X className="h-3.5 w-3.5" /> Cancel</>
                          : <><Plus className="h-3.5 w-3.5" /> New lesson</>}
                      </button>
                    </div>

                    {/* Lesson form */}
                    {lessonForm && lessonForm.course_id === c.id && (
                      <form onSubmit={handleSaveLesson} className="mb-4 rounded-sm border border-offWhite-300 bg-white p-5">
                        <h3 className="text-sm font-bold text-navy mb-4">{lessonForm.id ? "Edit lesson" : "New lesson"}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Title</label>
                            <input type="text" value={lessonForm.title} onChange={(e) => onLessonTitleChange(e.target.value)} className={inputClass} placeholder="Reframing pre-game nerves" required />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Slug</label>
                            <input
                              type="text"
                              value={lessonForm.slug}
                              onChange={(e) => { setLessonSlugEdited(true); updateLessonField("slug", e.target.value); }}
                              className={inputClass}
                              placeholder="reframing-pre-game-nerves"
                              required
                            />
                            <p className="mt-1 text-[11px] text-navy/40">Auto-generated from title. Must be unique within this course.</p>
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Video URL</label>
                            <input type="url" value={lessonForm.video_url} onChange={(e) => updateLessonField("video_url", e.target.value)} className={inputClass} placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                            <p className="mt-1 text-[11px] text-navy/40">Use the YouTube <span className="font-medium">embed</span> URL, e.g. https://www.youtube.com/embed/VIDEO_ID</p>
                          </div>
                          <div>
                            <label className={labelClass}>Duration</label>
                            <input type="text" value={lessonForm.duration} onChange={(e) => updateLessonField("duration", e.target.value)} className={inputClass} placeholder="10 min" />
                          </div>
                          <div>
                            <label className={labelClass}>Sort order</label>
                            <input type="number" value={lessonForm.sort_order} onChange={(e) => updateLessonField("sort_order", e.target.value)} className={inputClass} placeholder="0" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Content (markdown)</label>
                            <textarea value={lessonForm.content} onChange={(e) => updateLessonField("content", e.target.value)} rows={6} className={`${inputClass} resize-y font-mono text-xs leading-relaxed`} placeholder="Lesson notes, key takeaways, exercises…" />
                          </div>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                          <button type="submit" disabled={savingLesson} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 px-5 py-2 text-sm font-bold text-white transition-colors rounded-sm">
                            {savingLesson ? "Saving…" : lessonForm.id ? "Save changes" : "Add lesson"}
                          </button>
                          <button type="button" onClick={closeLessonForm} className="rounded-sm border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Lesson list */}
                    {lessonsLoading ? (
                      <p className="text-xs text-navy/40">Loading lessons…</p>
                    ) : lessons.length === 0 ? (
                      <p className="text-xs text-navy/40">No lessons yet. Add the first one above.</p>
                    ) : (
                      <div className="divide-y divide-offWhite-300 rounded-sm border border-offWhite-300 bg-white">
                        {lessons.map((l) => (
                          <div key={l.id} className="flex items-start justify-between gap-3 px-4 py-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-navy/8 text-[10px] font-bold text-navy/60 shrink-0">{l.sort_order}</span>
                                <p className="text-sm font-semibold text-navy truncate">{l.title}</p>
                              </div>
                              <p className="text-xs text-navy/45 mt-1 flex items-center gap-1.5 flex-wrap">
                                {l.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {l.duration}</span>}
                                {l.video_url && <span className="inline-flex items-center gap-1"><Video className="h-3 w-3" /> video</span>}
                                <span className="text-navy/40">/{l.slug}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button type="button" onClick={() => openEditLesson(l)} className="inline-flex items-center gap-1 rounded-sm border border-offWhite-300 px-2 py-1 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              <button type="button" onClick={() => setConfirmDeleteLessonId(l.id)} className="inline-flex items-center gap-1 rounded-sm border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
