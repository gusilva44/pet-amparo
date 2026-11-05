import './header.scss'
import Logo from '../../assets/imagens/Logo.webp'
import Casa from '../../assets/imagens/icones/icone-casa.png'
import Localizacao from '../../assets/imagens/icones/icone-localizacao.png'
import Sobre from '../../assets/imagens/icones/icone-sobre.png'

const ITENS_NAVEGACAO = [
    { id: 1, href: '#inicio', texto: 'Início', icone: Casa, alt: 'Ícone casa' },
    { id: 2, href: '#unidades', texto: 'Unidades', icone: Localizacao, alt: 'Ícone localização' },
    { id: 3, href: '#sobre', texto: 'Sobre', icone: Sobre, alt: 'Ícone sobre' }
]

export default function Header() {
    return (
        <header className='comps-header'>
            <section className="logo">
                <img className='comps-logo' src={Logo} alt="Logo Pet Amparo" />
            </section>

            <nav className='nav'>
                <ul>
                    {ITENS_NAVEGACAO.map((item) => (
                        <li key={item.id}>
                            <a className='links' href={item.href}>
                                <img className='icone-header' src={item.icone} alt={item.alt} />
                                {item.texto}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}
