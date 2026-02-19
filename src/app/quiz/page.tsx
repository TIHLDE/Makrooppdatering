'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { QuizSet, AssetType, QuizType } from '@prisma/client';
import { Gamepad2, Plus, Clock, HelpCircle, Loader2 } from 'lucide-react';

interface QuizWithCount extends QuizSet {
  _count: { questions: number };
}

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quiz?limit=10');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-purple-600" />
              Quiz
            </h1>
            <p className="text-gray-600 mt-2">
              Lær finans på en morsom måte! "Lættis læring" 🎓
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Lag ny quiz</span>
          </button>
        </div>

        {/* Quiz Generator Panel */}
        {showGenerator && (
          <QuizGenerator onClose={() => setShowGenerator(false)} onSuccess={fetchQuizzes} />
        )}

        {/* Quiz Types Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <QuizTypeCard
            type="MULTIPLE_CHOICE"
            title="Multiple Choice"
            description="Velg riktig svar fra flere alternativer. Test kunnskap om spesifikke nyheter."
            icon={<HelpCircle className="w-6 h-6" />}
          />
          <QuizTypeCard
            type="MATCH_PAIRS"
            title="Match Par"
            description="Koble sammen relaterte nyheter. Perfekt for å forstå sammenhenger."
            icon={<div className="flex gap-1"><div className="w-3 h-3 bg-current rounded-full" /><div className="w-3 h-3 bg-current rounded-full" /></div>}
          />
          <QuizTypeCard
            type="FIND_CONNECTION"
            title="Finn Sammenhengen"
            description="Se bilder/ikoner og finn ut hvilken finansiell hendelse de representerer."
            icon={<div className="grid grid-cols-2 gap-0.5"><div className="w-2 h-2 bg-current" /><div className="w-2 h-2 bg-current" /><div className="w-2 h-2 bg-current" /><div className="w-2 h-2 bg-current" /></div>}
          />
        </div>

        {/* Quiz List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>

        {quizzes.length === 0 && !loading && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ingen quizer ennå
            </h3>
            <p className="text-gray-600 mb-4">
              Lag din første quiz for å komme i gang!
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Lag quiz nå
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function QuizTypeCard({ 
  type, 
  title, 
  description, 
  icon 
}: { 
  type: QuizType; 
  title: string; 
  description: string;
  icon: React.ReactNode;
}) {
  const colors = {
    MULTIPLE_CHOICE: 'bg-blue-50 border-blue-200 text-blue-700',
    MATCH_PAIRS: 'bg-green-50 border-green-200 text-green-700',
    FIND_CONNECTION: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colors[type]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center space-x-3 mb-3">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: QuizWithCount }) {
  const router = useRouter();

  const typeColors = {
    MULTIPLE_CHOICE: 'bg-blue-100 text-blue-800',
    MATCH_PAIRS: 'bg-green-100 text-green-800',
    FIND_CONNECTION: 'bg-orange-100 text-orange-800',
  };

  const typeLabels = {
    MULTIPLE_CHOICE: 'Multiple Choice',
    MATCH_PAIRS: 'Match Par',
    FIND_CONNECTION: 'Finn Sammenhengen',
  };

  return (
    <div 
      onClick={() => router.push(`/quiz/${quiz.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[quiz.type]}`}>
          {typeLabels[quiz.type]}
        </span>
        <span className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {quiz._count.questions} spørsmål
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {quiz.title}
      </h3>

      {quiz.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {quiz.assetTypes.map((type) => (
          <span 
            key={type}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>Opprettet {new Date(quiz.createdAt).toLocaleDateString('nb-NO')}</span>
        <span className="text-purple-600 font-medium">Start →</span>
      </div>
    </div>
  );
}

function QuizGenerator({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MULTIPLE_CHOICE' as QuizType,
    questionCount: 10,
    assetTypes: [] as AssetType[],
    timeRange: '7d',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      
      if (formData.timeRange === '24h') {
        dateFrom.setDate(dateFrom.getDate() - 1);
      } else if (formData.timeRange === '7d') {
        dateFrom.setDate(dateFrom.getDate() - 7);
      } else {
        dateFrom.setDate(dateFrom.getDate() - 30);
      }

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Generer ny quiz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tittel
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="f.eks. Ukas Finans Quiz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivelse (valgfritt)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="En kort beskrivelse av quizen..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz-type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as QuizType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="MATCH_PAIRS">Match Par</option>
              <option value="FIND_CONNECTION">Finn Sammenhengen</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tidsperiode
              </label>
              <select
                value={formData.timeRange}
                onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="24h">Siste 24 timer</option>
                <option value="7d">Siste 7 dager</option>
                <option value="30d">Siste 30 dager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Antall spørsmål
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={formData.questionCount}
                onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verdipapirtyper
            </label>
            <div className="flex flex-wrap gap-2">
              {(['CRYPTO', 'MACRO', 'EQUITY', 'GEOPOLITICS'] as AssetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const newTypes = formData.assetTypes.includes(type)
                      ? formData.assetTypes.filter(t => t !== type)
                      : [...formData.assetTypes, type];
                    setFormData({ ...formData, assetTypes: newTypes });
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.assetTypes.includes(type)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={generating || formData.assetTypes.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Genererer...
                </>
              ) : (
                'Generer Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
