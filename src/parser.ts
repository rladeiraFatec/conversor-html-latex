import { Stack } from "./stack.js";

function limparTag(tag: string): string {
    return tag.split(" ")[0].toLowerCase();
}

function escaparLatex(caractere: string): string {
    switch (caractere) {
        case '&': return '\\&';
        case '%': return '\\%';
        case '$': return '\\$';
        case '#': return '\\#';
        case '_': return '\\_';
        default:  return caractere;
    }
}

export function converter(html: string): string {
    let resultado = "";
    const pilha = new Stack();
    let i = 0;

    // Adiciona preâmbulo do documento
    resultado = "\\documentclass{article}\n";
    resultado += "\\usepackage[utf8]{inputenc}\n";
    resultado += "\\usepackage[T1]{fontenc}\n";
    resultado += "\\begin{document}\n\n";

    while (i < html.length) {
        if (html[i] === "<") {
            let j = i + 1;
            let tagAcumulada = "";
            
            while (j < html.length && html[j] !== ">") {
                tagAcumulada += html[j];
                j++;
            }
            
            const tag = limparTag(tagAcumulada);

            if (j >= html.length) {
                resultado += html[i];
                i = j;
                continue;
            }

            if (tag.startsWith("/")) {
                let esperado = "";
                let tokenFechamento = "";

                switch (tag) {
                    case '/p':
                        tokenFechamento = "\n\n";
                        esperado = "p";
                        break;
                    case '/b':
                    case '/strong':
                        tokenFechamento = "}";
                        esperado = "b";
                        break;
                    case '/i':
                    case '/em':
                        tokenFechamento = "}";
                        esperado = "i";
                        break;
                    case '/ul':
                        tokenFechamento = "\\end{itemize}\n";
                        esperado = "ul";
                        break;
                    case '/ol':
                        tokenFechamento = "\\end{enumerate}\n";
                        esperado = "ol";
                        break;
                    case '/li':
                        tokenFechamento = "\n";
                        esperado = "li";
                        break;
                    case '/h1':
                        tokenFechamento = "}\n";
                        esperado = "h1";
                        break;
                    case '/h2':
                        tokenFechamento = "}\n";
                        esperado = "h2";
                        break;
                    default:
                        i = j;
                        i++;
                        continue;
                }

                if (pilha.vazia() || pilha.topo() !== esperado) {
                    return "Erro de Sintaxe: Tag fechada incorretamente.";
                }

                resultado += tokenFechamento;
                pilha.pop();

            } else {
                switch (tag) {
                    case 'p':
                        pilha.push("p");
                        break;
                    case 'b':
                    case 'strong':
                        resultado += "\\textbf{";
                        pilha.push("b");
                        break;
                    case 'i':
                    case 'em':
                        resultado += "\\textit{";
                        pilha.push("i");
                        break;
                    case 'ul':
                        resultado += "\\begin{itemize}\n";
                        pilha.push("ul");
                        break;
                    case 'ol':
                        resultado += "\\begin{enumerate}\n";
                        pilha.push("ol");
                        break;
                    case 'li':
                        resultado += "\\item ";
                        pilha.push("li");
                        break;
                    case 'h1':
                        resultado += "\\section{";
                        pilha.push("h1");
                        break;
                    case 'h2':
                        resultado += "\\subsection{";
                        pilha.push("h2");
                        break;
                    case 'br':
                    case 'br/':
                        resultado += "\\\\\n";
                        break;
                    default:
                        break;
                }
            }
            
            i = j;
        } else {
            resultado += escaparLatex(html[i]);
        }
        i++;
    }

    if (!pilha.vazia()) {
        return "Erro de Sintaxe: Existem tags não fechadas.";
    }

    // Adiciona final do documento
    resultado += "\n\\end{document}";

    return resultado.trim();
}