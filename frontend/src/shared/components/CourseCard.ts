import { el } from '../utils/dom';
export class CourseCard {
    constructor(private props: { id: string; title: string; image: string }) {}
    render(): HTMLElement {
        return el('article', { className: 'course-card' },
            el('div', { className: 'course-card__image-wrapper'},
                el('img', { src: this.props.image, className: 'course-card__image' })
            ),
            el('div', { className: 'course-card__content'},
                el('h3', { className: 'course-card__title' }, this.props.title),
                el('button', { className: 'btn', onClick: () => console.log('Ir para', this.props.id) }, 'Acessar')
            )
        ) as HTMLElement;
    }
}