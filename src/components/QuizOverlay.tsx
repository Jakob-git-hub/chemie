import { useState } from 'react';
import { Play, Trophy, Zap, Lightbulb, ArrowRight, X, RotateCcw, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizStore, type Difficulty, type GameMode } from '@/store/useQuizStore';
import { generateExplanation } from '@/utils/quizGenerator';
import { cn } from '@/lib/utils';

export function QuizOverlay() {
  const {
    gameMode,
    difficulty,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    currentHintIndex,
    score,
    streak,
    highScore,
    totalQuestions,
    correctAnswers,
    startQuiz,
    selectAnswer,
    nextQuestion,
    requestHint,
    endQuiz,
    setDifficulty
  } = useQuizStore();

  const [showModeSelection, setShowModeSelection] = useState(true);

  const handleStartQuiz = (mode: GameMode) => {
    setShowModeSelection(false);
    startQuiz(mode, difficulty);
  };

  const handleEndQuiz = () => {
    endQuiz();
    setShowModeSelection(true);
  };

  // Quiz beendet - Ergebnisübersicht
  if (gameMode === 'idle' && !showModeSelection && totalQuestions > 0) {
    return (
      <Card className="mb-6 border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Quiz beendet!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-950/30">
              <Trophy className="mx-auto h-6 w-6 text-yellow-600" />
              <div className="mt-1 text-2xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">Punkte</div>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-950/30">
              <Check className="mx-auto h-6 w-6 text-green-600" />
              <div className="mt-1 text-2xl font-bold">{correctAnswers}/{totalQuestions}</div>
              <div className="text-xs text-muted-foreground">Richtig</div>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Zap className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-1 text-2xl font-bold">{highScore}</div>
              <div className="text-xs text-muted-foreground">Highscore</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowModeSelection(true)} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Nochmal spielen
            </Button>
            <Button variant="outline" onClick={handleEndQuiz} className="flex-1">
              Zurück zur Übersicht
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Modus-Auswahl
  if (showModeSelection) {
    return (
      <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            3D-Molekül-Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Highscore anzeigen */}
          {highScore > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Highscore: {highScore} Punkte
            </div>
          )}

          {/* Schwierigkeitsgrad */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Schwierigkeitsgrad:</label>
            <div className="flex gap-2">
              {(['beginner', 'advanced', 'expert'] as Difficulty[]).map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty(d)}
                  className="flex-1"
                >
                  {d === 'beginner' && 'Anfänger'}
                  {d === 'advanced' && 'Fortgeschritten'}
                  {d === 'expert' && 'Experte'}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {difficulty === 'beginner' && 'Wasser, Methan, CO₂, Ammoniak, Ethanol'}
              {difficulty === 'advanced' && 'Aromaten, Ester, Carbonsäuren, Ketone'}
              {difficulty === 'expert' && 'Komplexe Biomoleküle und Arzneistoffe'}
            </p>
          </div>

          {/* Quiz-Modus Buttons */}
          <div className="grid gap-3">
            <Button
              onClick={() => handleStartQuiz('identification')}
              className="h-auto justify-start py-4 text-left"
              variant="default"
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <div className="font-semibold">🎯 Modus A: Erkenne das Molekül</div>
                  <div className="text-sm opacity-80">
                    Errate den IUPAC- oder Trivialnamen des angezeigten Moleküls
                  </div>
                </div>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Button>

            <Button
              onClick={() => handleStartQuiz('functional_groups')}
              className="h-auto justify-start py-4 text-left"
              variant="secondary"
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <div className="font-semibold">🔬 Modus B: Funktionelle Gruppen Finder</div>
                  <div className="text-sm opacity-80">
                    Klicke auf das richtige Atom/die richtige Gruppe im 3D-Modell
                  </div>
                </div>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Aktives Quiz
  if (!currentQuestion) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Lade nächste Frage...</p>
        </CardContent>
      </Card>
    );
  }

  const explanation = generateExplanation(
    currentQuestion.molecule,
    isCorrect ?? false,
    selectedAnswer ?? undefined
  );

  return (
    <Card className={cn(
      "mb-6 border-2 transition-all duration-300",
      isCorrect === true && "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg shadow-green-500/20",
      isCorrect === false && "border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg shadow-red-500/20",
      isCorrect === null && "border-primary/30"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
              {gameMode === 'identification' ? '🎯 Molekül erkennen' : '🔬 Funkt. Gruppe'}
            </span>
            <span className="text-sm text-muted-foreground">
              Frage {totalQuestions + 1}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleEndQuiz}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score-Anzeige */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-bold">{score}</span>
              <span className="text-sm text-muted-foreground">XP</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-bold">{streak}</span>
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Highscore: {highScore}
          </div>
        </div>

        {/* Frage */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {gameMode === 'identification'
              ? 'Welches Molekül siehst du?'
              : 'Finde die funktionelle Gruppe!'}
          </h3>
          {gameMode === 'functional_groups' && currentQuestion.functionalGroupTarget && (
            <p className="mt-1 text-sm text-muted-foreground">
              Gesucht: <span className="font-medium text-primary">{currentQuestion.functionalGroupTarget.replace('_', ' ')}</span>
            </p>
          )}
        </div>

        {/* Antwortoptionen */}
        <div className="grid gap-2">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;
            const showResult = isAnswered;

            let buttonClass = 'justify-start py-3 h-auto';
            let icon = null;

            if (showResult) {
              if (isCorrectOption) {
                buttonClass += ' bg-green-100 border-green-500 hover:bg-green-100 dark:bg-green-950/50 dark:border-green-600';
                icon = <Check className="h-4 w-4 text-green-600" />;
              } else if (isSelected && !isCorrectOption) {
                buttonClass += ' bg-red-100 border-red-500 hover:bg-red-100 dark:bg-red-950/50 dark:border-red-600';
                icon = <XCircle className="h-4 w-4 text-red-600" />;
              } else {
                buttonClass += ' opacity-50';
              }
            }

            return (
              <Button
                key={`${option}-${index}`}
                variant="outline"
                className={cn(buttonClass, 'text-left')}
                onClick={() => !isAnswered && selectAnswer(option)}
                disabled={isAnswered}
              >
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {icon}
              </Button>
            );
          })}
        </div>

        {/* Feedback / Erklärung */}
        {isAnswered && (
          <div
            className={cn(
              "rounded-lg p-3 text-sm",
              isCorrect ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
            )}
            role="status"
            aria-live="polite"
          >
            <p className={cn(
              "font-medium",
              isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            )}>
              {isCorrect ? '✅ Richtig!' : '❌ Leider falsch'}
            </p>
            <p className="mt-1 text-muted-foreground">{explanation}</p>
          </div>
        )}

        {/* Hinweis */}
        {isAnswered && currentQuestion.molecule.hints && (
          <div className="space-y-2">
            {currentHintIndex > 0 && !isCorrect && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm">
                  <span className="font-medium text-amber-700 dark:text-amber-300">💡 Hinweis:</span>{' '}
                  {currentQuestion.molecule.hints[currentHintIndex - 1]}
                </p>
              </div>
            )}
            {!isCorrect && currentHintIndex < (currentQuestion.molecule.hints?.length || 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestHint}
                className="w-full"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Hinweis anzeigen (-25 XP)
              </Button>
            )}
          </div>
        )}

        {/* Nächste Frage Button */}
        {isAnswered && (
          <Button onClick={nextQuestion} className="w-full" size="lg">
            Nächste Frage
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Button zum Starten des Quiz (platziert in der Molekül-Ansicht)
export function QuizStartButton() {
  const { gameMode, startQuiz, setDifficulty, difficulty } = useQuizStore();
  const [showDropdown, setShowDropdown] = useState(false);

  if (gameMode !== 'idle') {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        Quiz starten
      </Button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-background p-3 shadow-lg">
            <p className="mb-2 text-sm font-medium">Schwierigkeitsgrad:</p>
            <div className="mb-3 flex gap-2">
              {(['beginner', 'advanced', 'expert'] as Difficulty[]).map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty(d)}
                  className="flex-1 text-xs"
                >
                  {d === 'beginner' ? 'Anf.' : d === 'advanced' ? 'Fort.' : 'Exp.'}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  startQuiz('identification', difficulty);
                  setShowDropdown(false);
                }}
              >
                🎯 Molekül erkennen
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  startQuiz('functional_groups', difficulty);
                  setShowDropdown(false);
                }}
              >
                🔬 Funkt. Gruppen
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
