import { useState } from 'react';
import { BookPlus, Loader2, Star } from 'lucide-react';
import { supabase, type LivroInput } from '../lib/supabaseClient';

type Props = {
  onSaved: () => void;
};

const generos = [
  'Romance',
  'Ficção Científica',
  'Fantasia',
  'Mistério',
  'Suspense',
  'Biografia',
  'História',
  'Autoajuda',
  'Poesia',
  'Drama',
  'Aventura',
  'Outro',
];

const inputBase =
  'w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20';

export default function LivroForm({ onSaved }: Props) {
  const [form, setForm] = useState<LivroInput>({
    titulo: '',
    autor: '',
    genero: '',
    ano_publicacao: null,
    numero_paginas: null,
    editora: '',
    avaliacao: null,
    resenha: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['ano_publicacao', 'numero_paginas'];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleRating = (n: number) => {
    setForm((prev) => ({ ...prev, avaliacao: prev.avaliacao === n ? null : n }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.titulo.trim() || !form.autor.trim()) {
      setError('Título e autor são obrigatórios.');
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from('livros').insert([form]);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    setForm({
      titulo: '',
      autor: '',
      genero: '',
      ano_publicacao: null,
      numero_paginas: null,
      editora: '',
      avaliacao: null,
      resenha: '',
    });
    onSaved();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Livro cadastrado com sucesso!
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Ex.: Dom Casmurro"
            className={inputBase}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Autor <span className="text-red-500">*</span>
          </label>
          <input
            name="autor"
            value={form.autor}
            onChange={handleChange}
            placeholder="Ex.: Machado de Assis"
            className={inputBase}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Gênero</label>
          <select name="genero" value={form.genero ?? ''} onChange={handleChange} className={inputBase}>
            <option value="">Selecione...</option>
            {generos.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Editora</label>
          <input
            name="editora"
            value={form.editora ?? ''}
            onChange={handleChange}
            placeholder="Ex.: Companhia das Letras"
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Ano de Publicação</label>
          <input
            name="ano_publicacao"
            type="number"
            value={form.ano_publicacao ?? ''}
            onChange={handleChange}
            placeholder="Ex.: 1899"
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Nº de Páginas</label>
          <input
            name="numero_paginas"
            type="number"
            value={form.numero_paginas ?? ''}
            onChange={handleChange}
            placeholder="Ex.: 256"
            className={inputBase}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Avaliação</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleRating(n)}
              className="rounded p-1 transition hover:scale-110"
              aria-label={`Avaliar com ${n} estrela(s)`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  form.avaliacao && n <= form.avaliacao
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            </button>
          ))}
          {form.avaliacao && (
            <span className="ml-2 text-sm text-stone-500">{form.avaliacao}/5</span>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Resenha / Comentário</label>
        <textarea
          name="resenha"
          value={form.resenha ?? ''}
          onChange={handleChange}
          rows={4}
          placeholder="Conte o que achou do livro..."
          className={`${inputBase} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <BookPlus className="h-5 w-5" />
            Cadastrar Livro
          </>
        )}
      </button>
    </form>
  );
}
