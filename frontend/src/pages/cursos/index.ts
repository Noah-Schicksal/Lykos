import '../../shared/styles/global.css';
import { CourseCard } from '../../shared/components/CourseCard';
const app = document.getElementById('app');
// Exemplo de uso
const card = new CourseCard({ id: '1', title: 'Curso TypeScript', image: 'https://via.placeholder.com/150' });
app?.appendChild(card.render());