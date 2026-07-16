import { useEffect, useState } from 'react';
import { BookOpen, Loader2, Pencil, Star, Trash2, X } from 'lucide-react';
import { supabase, type Livro } from '../lib/supabaseClient';

type Props = {
  refreshKey: number;
  onDeleted: () => void;
};

export default function LivroList({ refreshKey, onDeleted }: Props) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Livro>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchLivros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function fetchLivros() {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('livros')
      .select('*')
      .order('criado_em', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLivros(data ?? []);
    }
    setLoading(false);
  }

  function startEdit(livro: Livro) {
    setEditingId(livro.id);
    setEditForm({ ...livro });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const numericFields = ['ano_publicacao', 'numero_paginas'];
    setEditForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? null : Number(value)) : value,
    }));
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    const { avaliacao, ano_publicacao, numero_paginas, autor, editora, genero, resenha, titulo } = editForm;
    const { error: updateError } = await supabase
      .from('livros')
      .update({ avaliacao, ano_publicacao, numero_paginas, autor, editora, genero, resenha, titulo })
      .eq('id', id);

    setSavingEdit(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    cancelEdit();
    fetchLivros();
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este livro?')) return;
    const { error: deleteError } = await supabase.from('livros').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onDeleted();
    fetchLivros();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Erro ao carregar livros: {error}
      </div>
    );
  }

  if (livros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="h-16 w-16 text-stone-300" />
        <p className="mt-4 text-lg font-medium text-stone-500">Nenhum livro cadastrado ainda</p>
        <p className="text-sm text-stone-400">Use o formulário para adicionar o primeiro livro do clube!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {livros.map((livro) => {
        const isEditing = editingId === livro.id;
        return (
          <div
            key={livro.id}
            className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            {isEditing ? (
              <div className="space-y-3">
                <input
                  name="titulo"
                  value={editForm.titulo ?? ''}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Título"
                />
                <input
                  name="autor"
                  value={editForm.autor ?? ''}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Autor"
                />
                <input
                  name="genero"
                  value={editForm.genero ?? ''}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Gênero"
                />
                <input
                  name="editora"
                  value={editForm.editora ?? ''}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Editora"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="ano_publicacao"
                    type="number"
                    value={editForm.ano_publicacao ?? ''}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                    placeholder="Ano"
                  />
                  <input
                    name="numero_paginas"
                    type="number"
                    value={editForm.numero_paginas ?? ''}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                    placeholder="Páginas"
                  />
                </div>
                <textarea
                  name="resenha"
                  value={editForm.resenha ?? ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full resize-none rounded-md border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Resenha"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(livro.id)}
                    disabled={savingEdit}
                    className="flex-1 rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
                  >
                    {savingEdit ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold leading-snug text-stone-800">
                      {livro.titulo}
                    </h3>
                    <p className="text-sm text-stone-500">{livro.autor}</p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(livro)}
                      className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-700"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(livro.id)}
                      className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {livro.genero && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800">
                      {livro.genero}
                    </span>
                  )}
                  {livro.ano_publicacao && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-600">
                      {livro.ano_publicacao}
                    </span>
                  )}
                  {livro.numero_paginas && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-600">
                      {livro.numero_paginas} págs.
                    </span>
                  )}
                </div>

                {livro.editora && (
                  <p className="mt-3 text-xs text-stone-400">Editora: {livro.editora}</p>
                )}

                {livro.avaliacao && (
                  <div className="mt-3 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < livro.avaliacao! ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {livro.resenha && (
                  <p className="mt-3 line-clamp-3 flex-1 text-sm italic leading-relaxed text-stone-500">
                    "{livro.resenha}"
                  </p>
                )}

                <p className="mt-4 border-t border-stone-100 pt-2 text-xs text-stone-400">
                  Adicionado em {new Date(livro.criado_em).toLocaleDateString('pt-BR')}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
