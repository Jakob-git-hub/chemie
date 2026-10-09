import { FlaskConical } from 'lucide-react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import GuidedReactionLesson from '@/components/lesson/GuidedReactionLesson';
import { GUIDED_REACTION_LESSONS } from '@/data/lessons';
import NotFound from './not-found';

export default function LessonRoute() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const lesson = GUIDED_REACTION_LESSONS.find((item) => item.id === lessonId);

  if (!lesson) return <NotFound />;

  return (
    <>
      <PageHeader
        title={lesson.title}
        description="Arbeite Schritt für Schritt und prüfe nach jedem Versuch die Atombilanz."
        icon={<FlaskConical className="h-5 w-5" aria-hidden="true" />}
      />
      <GuidedReactionLesson lesson={lesson} />
    </>
  );
}
