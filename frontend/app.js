document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'http://localhost:8000';
    const professores = [];
    const turmas = [];
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    const horariosMatutino = [
        "07:00 - 07:50", "07:50 - 08:40", "08:40 - 09:30", "09:45 - 10:35", "10:35 - 11:25"
    ];
    const horariosVespertino = [
        "12:30 - 13:20", "13:20 - 14:10", "14:10 - 15:00", "15:15 - 16:00"
    ];
    const horariosNoturno = [
        "18:20 - 19:10", "19:10 - 20:00", "20:00 - 21:05", "21:05 - 21:55"
    ];

   function adicionarTurno(titulo, horarios) {
    const tbody = document.getElementById('table-body');

    const turnoRow = document.createElement('tr');
    const turnoCell = document.createElement('td');
    turnoCell.colSpan = diasSemana.length + 1; // Alcança todas as colunas
    turnoCell.textContent = titulo; // Nome do turno (matutino, vespertino, noturno)
    turnoCell.classList.add('turno-header'); // Estilo visual do turno
    turnoRow.appendChild(turnoCell);
    tbody.appendChild(turnoRow);

    // Adicionar os horários para este turno
    horarios.forEach(horario => {
        const row = document.createElement('tr');
        const horarioCell = document.createElement('td');
        horarioCell.textContent = horario;
        row.appendChild(horarioCell);

        diasSemana.forEach(dia => {
            const cell = document.createElement('td');
            cell.dataset.horario = horario;
            cell.dataset.dia = dia;
            cell.textContent = 'Aula vaga';
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}
    // Inicializa a tabela com os turnos
    adicionarTurno("Turno Matutino", horariosMatutino);
    adicionarTurno("Turno Vespertino", horariosVespertino);
    adicionarTurno("Turno Noturno", horariosNoturno);

    // Preenche opções nos selects de professores e turmas
    function preencherOpcoes() {
        const selectProfessor = document.getElementById('select-professor');
        const selectTurma = document.getElementById('select-turma');
        const selectProfessorFiltro = document.getElementById('select-professor-filtro');
        const selectTurmaFiltro = document.getElementById('select-turma-filtro');

        // Atualiza os selects com as opções de professores e turmas cadastrados
        selectProfessor.innerHTML = professores.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');
        selectTurma.innerHTML = turmas.map(t => `<option value="${t}">${t}</option>`).join('');

        // Preenche os selects de filtros com "Todos" como opção padrão
        selectProfessorFiltro.innerHTML = `<option value="">Todos</option>` + professores.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');
        selectTurmaFiltro.innerHTML = `<option value="">Todas</option>` + turmas.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    function filtrarHorarios() {
        const professorFiltro = document.getElementById('select-professor-filtro').value;
        const turmaFiltro = document.getElementById('select-turma-filtro').value;
        const turnoSelecionado = document.querySelector('input[name="turno"]:checked').value;
        const tbodyFiltro = document.getElementById('filtro-table-body');
        
        // Certificando que a tabela está sendo limpa corretamente
        tbodyFiltro.innerHTML = ''; // Limpa o conteúdo anterior
    
        // Função para adicionar uma linha de cabeçalho de turno
        function adicionarLinhaTurno(titulo) {
            const turnoRow = document.createElement('tr');
            const turnoCell = document.createElement('td');
            
            turnoCell.colSpan = diasSemana.length + 1; // Ocupa todas as colunas
            turnoCell.textContent = titulo; // Exibe o título do turno (Matutino, Vespertino, Noturno)
            turnoCell.classList.add('turno-header'); // Adiciona a classe de estilo para o cabeçalho
            
            turnoRow.appendChild(turnoCell);
            tbodyFiltro.appendChild(turnoRow); // Adiciona a linha do turno na tabela de filtro
            console.log(`Adicionando turno: ${titulo}`); // Debug para ver se a linha foi inserida
        }
    
        // Função para preencher os horários filtrados
        function preencherLinhaHorario(horario, horarioOriginal) {
            const row = document.createElement('tr');
            const horarioCell = document.createElement('td');
            
            horarioCell.textContent = horario; // Exibe o horário
            row.appendChild(horarioCell);
    
            diasSemana.forEach(dia => {
                const cell = document.createElement('td');
                cell.textContent = 'Aula vaga'; // Valor padrão
    
                // Filtrando os horários com base no professor e na turma
                const diaOrig = horarioOriginal.querySelector(`td[data-horario="${horario}"][data-dia="${dia}"]`);
                if (diaOrig) {
                    const textoAula = diaOrig.textContent.trim();
                    if (
                        (professorFiltro === "" || textoAula.startsWith(professorFiltro)) &&
                        (turmaFiltro === "" || textoAula.includes(`(${turmaFiltro})`))
                    ) {
                        cell.textContent = textoAula; // Exibe a aula correspondente
                    }
                }
    
                row.appendChild(cell);
            });
    
            tbodyFiltro.appendChild(row); // Adiciona a linha na tabela de filtro
        }
            // Verifica e exibe os turnos selecionados
        const horariosOriginais = document.getElementById('table-body').querySelectorAll('tr');
    
        // Exibe o turno matutino se o turno selecionado for 'integral' ou 'ambos'
        if (turnoSelecionado === 'integral' || turnoSelecionado === 'ambos') {
            adicionarLinhaTurno('Turno Matutino');
            horariosMatutino.forEach(horario => {
                const horarioOriginal = Array.from(horariosOriginais).find(tr => tr.querySelector('td:first-child').textContent.trim() === horario);
                if (horarioOriginal) {
                    preencherLinhaHorario(horario, horarioOriginal);
                }
            });
    
            adicionarLinhaTurno('Turno Vespertino');
            horariosVespertino.forEach(horario => {
                const horarioOriginal = Array.from(horariosOriginais).find(tr => tr.querySelector('td:first-child').textContent.trim() === horario);
                if (horarioOriginal) {
                    preencherLinhaHorario(horario, horarioOriginal);
                }
            });
        }
    
        // Exibe o turno noturno se o turno selecionado for 'noturno' ou 'ambos'
        if (turnoSelecionado === 'noturno' || turnoSelecionado === 'ambos') {
            adicionarLinhaTurno('Turno Noturno');
            horariosNoturno.forEach(horario => {
                const horarioOriginal = Array.from(horariosOriginais).find(tr => tr.querySelector('td:first-child').textContent.trim() === horario);
                if (horarioOriginal) {
                    preencherLinhaHorario(horario, horarioOriginal);
                }
            });
        }
    }
    // Evento para filtrar horários usando o botão já existente
document.getElementById('filtrar-horarios').addEventListener('click', filtrarHorarios);


// Evento de cadastro de professor
document.getElementById('professor-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('professor-name').value;
    const disponibilidade = Array.from(document.querySelectorAll('#disponibilidade input:checked')).map(input => input.value);
    const folgaDias = Array.from(document.querySelectorAll('#folga-dia .dia-checkbox:checked')).map(input => input.value);
    const folgaTurnos = Array.from(document.querySelectorAll('#folga-turno input:checked')).map(input => input.value);

    // Adicionar o professor ao array local
    professores.push({
        nome: nome,
        disponibilidade: disponibilidade,
        folga: { dias: folgaDias, turnos: folgaTurnos }
    });

    preencherOpcoes(); // Atualiza os selects
    alert('Professor cadastrado com sucesso!');
    this.reset();
});



    // Evento de cadastro de turma
    document.getElementById('turma-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const nome = document.getElementById('turma-name').value;
        turmas.push(nome);
        preencherOpcoes(); // Atualiza os selects
        alert('Turma cadastrada com sucesso!');
        this.reset();
    });

    // Evento de cadastro de aula
    document.getElementById('aula-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const professorNome = document.getElementById('select-professor').value;
        const professor = professores.find(p => p.nome === professorNome);
        const materia = document.getElementById('materia').value;
        const turma = document.getElementById('select-turma').value;
        const quantidadeAulas = parseInt(document.getElementById('quantidade-aulas-aula').value, 10);

        alocarAula(professor, materia, turma, quantidadeAulas);
        alert('Aula cadastrada com sucesso!');
        this.reset();
    });


// Aloca aulas respeitando folgas, disponibilidade e evitando horários consecutivos
function alocarAula(professor, materia, turma, quantidadeAulas) {
    let horariosDisponiveis = [];

    // Preenche os horários disponíveis com base na disponibilidade do professor
    if (professor.disponibilidade.includes('matutino')) horariosDisponiveis.push(...horariosMatutino);
    if (professor.disponibilidade.includes('vespertino')) horariosDisponiveis.push(...horariosVespertino);
    if (professor.disponibilidade.includes('noturno')) horariosDisponiveis.push(...horariosNoturno);

    let alocadas = 0;
    let todasCombinacoes = [];

    // Gera todas as combinações possíveis de horário e dia
    horariosDisponiveis.forEach(horario => {
        diasSemana.forEach(dia => {
            todasCombinacoes.push({ horario, dia });
        });
    });

    // Embaralha as combinações para uma alocação mais aleatória
    todasCombinacoes = todasCombinacoes.sort(() => Math.random() - 0.5);

    // Aloca as aulas evitando horários consecutivos
    for (let i = 0; i < todasCombinacoes.length && alocadas < quantidadeAulas; i++) {
        const { horario, dia } = todasCombinacoes[i];
        const turno = obterTurnoPorHorario(horario);

        // Verifica se a folga permite a alocação
        if (validarFolga(professor, dia, turno)) {
            const cell = document.querySelector(`td[data-horario="${horario}"][data-dia="${dia}"]`);

            // Evita horários consecutivos verificando o anterior e o próximo
            const horarioIndex = horariosDisponiveis.indexOf(horario);
            const horarioAnterior = horariosDisponiveis[horarioIndex - 1];
            const horarioProximo = horariosDisponiveis[horarioIndex + 1];
            const cellAnterior = document.querySelector(`td[data-horario="${horarioAnterior}"][data-dia="${dia}"]`);
            const cellProximo = document.querySelector(`td[data-horario="${horarioProximo}"][data-dia="${dia}"]`);

            if (
                cell && cell.textContent === 'Aula vaga' &&
                (!cellAnterior || cellAnterior.textContent !== `${professor.nome} - ${materia} (${turma})`) &&
                (!cellProximo || cellProximo.textContent !== `${professor.nome} - ${materia} (${turma})`)
            ) {
                cell.textContent = `${professor.nome} - ${materia} (${turma})`;
                alocadas++;
            }
        }
    }

    // Verifica se todas as aulas foram alocadas, se não, exibe erro
    if (alocadas < quantidadeAulas) {
        alert(`Erro: Apenas ${alocadas} de ${quantidadeAulas} aulas foram alocadas. Verifique a disponibilidade.`);
    } else {
        alert(`${quantidadeAulas} aulas alocadas com sucesso para ${professor.nome}.`);
    }
}



    // Valida se o horário está disponível com base na folga
    function validarFolga(professor, dia, turno) {
        return !(
            professor.folga.dias.includes(dia) && // Verifica se o dia está nos dias de folga
            professor.folga.turnos.includes(turno) // Verifica se o turno está nos turnos de folga
        );
    }

    // Obtém o turno com base no horário
    function obterTurnoPorHorario(horario) {
        if (horariosMatutino.includes(horario)) return 'matutino';
        if (horariosVespertino.includes(horario)) return 'vespertino';
        return 'noturno';
    }
    // Funções de exportação
    document.getElementById('exportar-pdf').addEventListener('click', function () {
        const doc = new jsPDF();
        doc.autoTable({ html: '#horario-table', headStyles: { fontStyle: 'bold' } });
        doc.save('horarios.pdf');
    });

    document.getElementById('exportar-excel').addEventListener('click', function () {
        const table = document.getElementById('horario-table');
        const workbook = XLSX.utils.table_to_book(table);
        XLSX.writeFile(workbook, 'horarios.xlsx');
    });

    document.getElementById('imprimir-tabela').addEventListener('click', function () {
        const printContent = document.getElementById('horario-table').outerHTML;
        const newWin = window.open('', '', 'width=800,height=600');
        newWin.document.write('<html><head><title>Imprimir Tabela</title></head><body>' + printContent + '</body></html>');
        newWin.document.close();
        newWin.print();
    });

    document.getElementById('exportar-filtro-pdf').addEventListener('click', function () {
        const doc = new jsPDF();
        doc.autoTable({ html: '#filtro-table', headStyles: { fontStyle: 'bold' } });
        doc.save('filtro_horarios.pdf');
    });

    document.getElementById('exportar-filtro-excel').addEventListener('click', function () {
        const table = document.getElementById('filtro-table');
        const workbook = XLSX.utils.table_to_book(table);
        XLSX.writeFile(workbook, 'filtro_horarios.xlsx');
    });

    document.getElementById('imprimir-filtro').addEventListener('click', function () {
        const printContent = document.getElementById('filtro-table').outerHTML;
        const newWin = window.open('', '', 'width=800,height=600');
        newWin.document.write('<html><head><title>Imprimir Filtro</title></head><body>' + printContent + '</body></html>');
        newWin.document.close();
        newWin.print();
    });
});

const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        document.getElementById(target).classList.add('active');
    });
});
function exportarParaPDF(tabelaId, nomeArquivo) {
    const { jsPDF } = window.jspdf;
    // Cria o PDF em modo paisagem (landscape)
    const doc = new jsPDF('landscape');

    // Adiciona o título
    doc.setFontSize(16);
    doc.text("Quadro de Horários", 14, 15);

    // Adiciona a data e hora da exportação
    const dataHora = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Exportado em: ${dataHora}`, 14, 23);

    // Exporta a tabela
    doc.autoTable({
        html: `#${tabelaId}`,
        startY: 30,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        margin: { top: 30 }
    });

    // Salva o PDF
    doc.save(nomeArquivo);
}

// Evento para o botão de exportar a tabela principal
document.getElementById('exportar-pdf').addEventListener('click', function() {
    exportarParaPDF('horario-table', 'horarios.pdf');
});

// Evento para o botão de exportar a tabela filtrada
document.getElementById('exportar-filtro-pdf').addEventListener('click', function() {
    exportarParaPDF('filtro-table', 'filtro_horarios.pdf');
});


document.querySelectorAll('#table-body td').forEach(cell => {
    cell.addEventListener('click', function () {
        if (!this.classList.contains('turno-header')) {
            this.setAttribute('contenteditable', 'true');
            this.focus();
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const salvarEdicaoBtn = document.getElementById('salvar-edicao');

    // Verifique se o botão existe e está na aba ativa antes de adicionar o event listener
    if (salvarEdicaoBtn) {
        salvarEdicaoBtn.addEventListener('click', function () {
            // Desativa o modo de edição em todas as células
            document.querySelectorAll('#table-body td').forEach(cell => {
                if (cell.hasAttribute('contenteditable')) {
                    cell.removeAttribute('contenteditable');
                }
            });

            alert('Alterações salvas com sucesso!');
        });
    } else {
        console.error('Botão Salvar Alterações não encontrado.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Sincronizar as tabelas ao abrir a aba "Editar Tabela"
    document.querySelector('.tab-link[data-tab="tab4"]').addEventListener('click', function () {
        sincronizarTabelas();
        // Tornar as células da tabela de edição editáveis
        document.querySelectorAll('#editar-table-body td').forEach(cell => {
            if (!cell.classList.contains('turno-header')) {
                cell.setAttribute('contenteditable', 'true'); // Editável apenas na aba Editar Tabela
            }
        });
    });

    // Função para sincronizar as tabelas entre "Gerar Horários" (não editável) e "Editar Tabela" (editável)
    function sincronizarTabelas() {
        const tabelaOriginal = document.getElementById('table-body'); // Tabela de Gerar Horários
        const tabelaEdicao = document.getElementById('editar-table-body'); // Tabela de Edição
        
        // Limpa a tabela de edição antes de preenchê-la
        tabelaEdicao.innerHTML = '';

        // Clona as linhas da tabela original para a tabela de edição
        tabelaOriginal.querySelectorAll('tr').forEach(row => {
            const novaLinha = row.cloneNode(true); // Clona a linha e seu conteúdo
            tabelaEdicao.appendChild(novaLinha); // Adiciona à tabela de edição
        });
    }

    // Salvar alterações feitas na aba "Editar Tabela" e refletir na aba "Gerar Horários"
    document.getElementById('salvar-edicao-tabela').addEventListener('click', function () {
        // Desativa o modo de edição nas células da tabela de edição
        document.querySelectorAll('#editar-table-body td').forEach(cell => {
            if (cell.hasAttribute('contenteditable')) {
                cell.removeAttribute('contenteditable'); // Desativa a edição
            }
        });

        // Atualiza a tabela "Gerar Horários" com as mudanças feitas na tabela de edição
        const tabelaOriginal = document.getElementById('table-body'); // Tabela de Gerar Horários
        const tabelaEdicao = document.getElementById('editar-table-body'); // Tabela de Edição
        
        // Limpa a tabela original antes de aplicar as alterações
        tabelaOriginal.innerHTML = ''; 

        // Copia as linhas atualizadas da tabela de edição para a tabela original
        tabelaEdicao.querySelectorAll('tr').forEach(row => {
            const novaLinha = row.cloneNode(true); // Clona a linha editada
            tabelaOriginal.appendChild(novaLinha); // Atualiza a tabela de Gerar Horários
        });

        alert('Alterações salvas com sucesso e sincronizadas com a tabela de Gerar Horários!');
    });

    // A aba "Gerar Horários" não permite edição
    document.querySelector('.tab-link[data-tab="tab2"]').addEventListener('click', function () {
        // Garante que a tabela na aba "Gerar Horários" não é editável
        document.querySelectorAll('#table-body td').forEach(cell => {
            cell.removeAttribute('contenteditable'); // Remove qualquer atributo de edição
        });
    });
});












document.addEventListener('DOMContentLoaded', function () {
    // Função de exportação de PDF
    function exportarParaPDF(tabelaId, nomeArquivo) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        // Título
        doc.setFontSize(16);
        doc.text("Quadro de Horários", 14, 15);

        // Data e hora da exportação
        const dataHora = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.text(`Exportado em: ${dataHora}`, 14, 23);

        // Exporta a tabela
        doc.autoTable({
            html: `#${tabelaId}`,
            startY: 30,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            margin: { top: 30 }
        });

        // Salva o PDF
        doc.save(nomeArquivo);
    }

    // Função de exportação para Excel
    function exportarParaExcel(tabelaId, nomeArquivo) {
        const table = document.getElementById(tabelaId);
        const workbook = XLSX.utils.table_to_book(table);
        XLSX.writeFile(workbook, nomeArquivo);
    }

    // Função para adicionar eventos de clique únicos
    function adicionarEventoUnico(idElemento, evento, callback) {
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            elemento.replaceWith(elemento.cloneNode(true)); // Remove todos os eventos anteriores
            const novoElemento = document.getElementById(idElemento); // Pega o novo elemento
            novoElemento.addEventListener(evento, callback); // Adiciona o evento novamente
        }
    }

    // Adicionando eventos para exportar a tabela principal em PDF e Excel
    adicionarEventoUnico('exportar-pdf', 'click', function () {
        exportarParaPDF('horario-table', 'horarios.pdf');
    });

    adicionarEventoUnico('exportar-excel', 'click', function () {
        exportarParaExcel('horario-table', 'horarios.xlsx');
    });

    // Adicionando eventos para exportar a tabela filtrada em PDF e Excel
    adicionarEventoUnico('exportar-filtro-pdf', 'click', function () {
        exportarParaPDF('filtro-table', 'filtro_horarios.pdf');
    });

    adicionarEventoUnico('exportar-filtro-excel', 'click', function () {
        exportarParaExcel('filtro-table', 'filtro_horarios.xlsx');
    });

    // Controle de abas
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
        });
    });
});

// Função para salvar horários com log
function salvarHorarios() {
    const horarios = [];
    const descricao = "Alteração manual do horário";
    const dataAtual = new Date().toISOString();

    // Coleta os dados da tabela
    document.querySelectorAll('#table-body tr').forEach(row => {
        const timeSlot = row.querySelector('td:first-child')?.textContent;
        if (timeSlot && !row.classList.contains('turno-header')) {
            row.querySelectorAll('td:not(:first-child)').forEach((cell, index) => {
                const dayOfWeek = diasSemana[index];
                const content = cell.textContent;
                if (content !== 'Aula vaga') {
                    horarios.push({
                        day: dayOfWeek,
                        time: timeSlot,
                        content: content
                    });
                }
            });
        }
    });

    // Salva no banco de dados
    fetch(`${API_URL}/api/schedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            horarios: horarios,
            data: dataAtual,
            descricao: descricao
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Horários salvos com sucesso!');
        // Atualiza o histórico
        carregarHistorico();
    })
    .catch(error => {
        console.error('Erro ao salvar horários:', error);
        alert('Erro ao salvar horários');
    });
}

// Função para carregar os horários do banco de dados
function carregarHorarios() {
    fetch(`${API_URL}/api/schedule`)
        .then(response => response.json())
        .then(horarios => {
            horarios.forEach(horario => {
                const cell = document.querySelector(`td[data-horario="${horario.time_slot}"][data-dia="${horario.day_of_week}"]`);
                if (cell) {
                    cell.textContent = `${horario.professor_name} - ${horario.subject} (${horario.class_name})`;
                }
            });
        })
        .catch(error => console.error('Erro ao carregar horários:', error));
}

// Adicionar evento ao botão de salvar
document.getElementById('salvar-edicao-tabela').addEventListener('click', function() {
    salvarHorarios();
});

// Carregar horários quando a página iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarHorarios();
});

// Função para salvar o horário atual
function salvarHorarioAtual() {
    const nome = document.getElementById('schedule-name').value;
    const escola = document.getElementById('school-name').value;
    const horarios = [];

    // Coleta os dados da tabela atual
    document.querySelectorAll('#table-body tr').forEach(row => {
        const timeSlot = row.querySelector('td:first-child')?.textContent;
        if (timeSlot && !row.classList.contains('turno-header')) {
            row.querySelectorAll('td:not(:first-child)').forEach((cell, index) => {
                horarios.push({
                    horario: timeSlot,
                    dia: diasSemana[index],
                    conteudo: cell.textContent
                });
            });
        }
    });

    // Envia para a API
    fetch(`${API_URL}/api/saved-schedules`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nome,
            school_name: escola,
            schedule_data: JSON.stringify(horarios)
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Horário salvo com sucesso!');
        carregarHorariosSalvos();
    })
    .catch(error => {
        console.error('Erro ao salvar horário:', error);
        alert('Erro ao salvar horário');
    });
}

// Função para carregar a lista de horários salvos
function carregarHorariosSalvos() {
    fetch(`${API_URL}/api/saved-schedules`)
        .then(response => response.json())
        .then(schedules => {
            const lista = document.getElementById('saved-schedules-list');
            lista.innerHTML = schedules.map(schedule => `
                <div class="schedule-card">
                    <h3>${schedule.name}</h3>
                    <p>Escola: ${schedule.school_name}</p>
                    <p>Data: ${new Date(schedule.created_at).toLocaleDateString()}</p>
                    <div class="schedule-actions">
                        <button onclick="carregarHorario(${schedule.id})">Visualizar</button>
                        <button onclick="editarHorario(${schedule.id})">Editar</button>
                    </div>
                </div>
            `).join('');
        });
}

// Adicionar eventos
document.getElementById('save-schedule-form').addEventListener('submit', function(e) {
    e.preventDefault();
    salvarHorarioAtual();
});

// Carregar horários salvos quando a página iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarHorariosSalvos();
});

// Adicionar no início do arquivo, após a definição das constantes
let escolaAtual = '';

// Função para mostrar popup
function mostrarPopup(mensagem) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = mensagem;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Função para adicionar nova escola
document.getElementById('nova-escola').addEventListener('click', function() {
    const input = document.getElementById('nova-escola-input');
    const nomeEscola = input.value.trim();
    
    if (!nomeEscola) {
        mostrarPopup('Por favor, digite o nome da escola');
        return;
    }

    fetch(`${API_URL}/api/schools`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: nomeEscola })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao cadastrar escola');
        }
        return response.json();
    })
    .then(data => {
        mostrarPopup('Escola cadastrada com sucesso!');
        input.value = '';
        carregarEscolas();
        atualizarListaEscolas();
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarPopup('Erro ao cadastrar escola');
    });
});

// Função para atualizar a lista de escolas
function atualizarListaEscolas() {
    fetch(`${API_URL}/api/schools`)
        .then(response => response.json())
        .then(escolas => {
            const listaEscolas = document.getElementById('escolas-lista');
            listaEscolas.innerHTML = escolas.map(escola => `
                <div class="escola-card">
                    <h3>${escola.nome}</h3>
                    <p>ID: ${escola.id}</p>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Erro ao carregar escolas:', error);
        });
}

// Carregar escolas quando a página iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarEscolas();
    atualizarListaEscolas();
});

// Atualizar o nome da escola no header quando selecionar
document.getElementById('escola-atual').addEventListener('change', function() {
    const escolaNome = this.options[this.selectedIndex].text;
    document.getElementById('escola-atual-nome').textContent = escolaNome;
});

// Função para carregar dados iniciais
function carregarDadosIniciais() {
    // Carregar professores
    fetch(`${API_URL}/api/professors`)
        .then(response => response.json())
        .then(data => {
            professores.push(...data);
            preencherOpcoes();
        });

    // Carregar turmas
    fetch(`${API_URL}/api/classes`)
        .then(response => response.json())
        .then(data => {
            turmas.push(...data);
            preencherOpcoes();
        });

    // Carregar horários
    carregarHorarios();
}

// Função para carregar histórico com lista de datas
function carregarHistorico() {
    fetch(`${API_URL}/api/history`)
        .then(response => response.json())
        .then(historico => {
            const listaHistorico = document.getElementById('historico-lista');
            listaHistorico.innerHTML = historico.map(item => `
                <div class="historico-item">
                    <div class="historico-info">
                        <h3>Data: ${new Date(item.created_at).toLocaleDateString()}</h3>
                        <p>Horário: ${new Date(item.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div class="historico-acoes">
                        <button onclick="visualizarHorarioHistorico(${item.id})" class="btn-visualizar">
                            Visualizar
                        </button>
                        <button onclick="editarHorarioHistorico(${item.id})" class="btn-editar">
                            Editar
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

// Função para visualizar horário do histórico
function visualizarHorarioHistorico(id) {
    fetch(`${API_URL}/api/history/${id}`)
        .then(response => response.json())
        .then(data => {
            const horarioView = document.getElementById('horario-selecionado');
            horarioView.style.display = 'block';
            
            // Criar nova tabela para este horário
            const tabelaHistorico = document.getElementById('horario-view-table');
            // Preencher tabela com os dados do horário
            preencherTabelaHistorico(tabelaHistorico, data.schedule_data);
        });
}

// Função para carregar a lista de datas com alterações
function carregarDatasHistorico() {
    fetch(`${API_URL}/api/history/dates`)
        .then(response => response.json())
        .then(datas => {
            const listaHistorico = document.getElementById('historico-lista');
            listaHistorico.innerHTML = datas.map(data => `
                <div class="historico-item">
                    <div class="historico-info">
                        <h3>Data: ${new Date(data.created_at).toLocaleDateString()}</h3>
                        <p>Horário: ${new Date(data.created_at).toLocaleTimeString()}</p>
                        <p class="descricao-mudanca">${data.description || 'Alteração no quadro de horários'}</p>
                    </div>
                    <div class="historico-acoes">
                        <button onclick="visualizarHorarioHistorico(${data.id})" class="btn-visualizar">
                            Visualizar
                        </button>
                        <button onclick="editarHorarioHistorico(${data.id})" class="btn-editar">
                            Editar
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

// Função para carregar lista de datas com cadastros
function carregarDatasComCadastros() {
    fetch(`${API_URL}/api/history/dates`)
        .then(response => response.json())
        .then(datas => {
            const listaHistorico = document.querySelector('.datas-cadastro');
            listaHistorico.innerHTML = datas.map(data => `
                <div class="data-item" onclick="carregarHorarioData('${data.data}')">
                    <h3>${new Date(data.data).toLocaleDateString()}</h3>
                    <p>Clique para visualizar</p>
                </div>
            `).join('');
        });
}

// Função para carregar horário de uma data específica
function carregarHorarioData(data) {
    fetch(`${API_URL}/api/history/date/${data}`)
        .then(response => response.json())
        .then(horarios => {
            preencherTabelaHistorico(horarios);
        });
}