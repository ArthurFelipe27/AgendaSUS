# 🚀 AgendaSUS: Sistema de Agendamento de Consultas

Este projeto é um sistema full-stack de agendamento e gerenciamento de consultas online, simulando um ambiente para o Sistema Único de Saúde (SUS). A aplicação é construída com Java e Spring Boot no backend, e HTML/CSS/JavaScript no frontend.  

O sistema oferece três portais distintos com diferentes níveis de acesso e funcionalidades:  
👤 Portal do Paciente: Focado em agendamento e visualização do histórico médico.  
🩺 Portal do Médico: Focado no gerenciamento da agenda e no atendimento ao paciente.  
📊 Portal do Diretor (Admin): Focado na administração geral do sistema, unidades e usuários.  

## 🖼️ Demonstração 

**Tela de Login**
<img width="1920" height="1080" alt="Tela de Login" src="https://github.com/user-attachments/assets/5e3bdb0c-cfac-4b93-a682-5d1f85371c15" />

**Agendamento (Paciente)**
<img width="1875" height="965" alt="Captura de tela 2025-11-11 225800" src="https://github.com/user-attachments/assets/d61abf2a-3ae3-4d67-bbb6-56652d7adba5" />
<img width="1758" height="942" alt="Captura de tela 2025-11-11 230223" src="https://github.com/user-attachments/assets/ae4b53c6-a89b-484a-94d6-e70d92044bca" />
<img width="1692" height="941" alt="Captura de tela 2025-11-11 230236" src="https://github.com/user-attachments/assets/10a7331f-8a7d-41ee-86e6-afda15addcaa" />

**Atendimento (Médico)**
<img width="1767" height="933" alt="Captura de tela 2025-11-11 225852" src="https://github.com/user-attachments/assets/0ef55f96-4dee-4b60-aad4-e068b7756ad8" />
<img width="1751" height="964" alt="Captura de tela 2025-11-11 230134" src="https://github.com/user-attachments/assets/61f5508a-1413-4aa1-b0af-f47d6db2fce1" />



## 🎮 Como Executar o Projeto

Para executar este projeto localmente, você precisará ter o Java (JDK 17+), Maven e um banco de dados MySQL instalados e configurados.

1. Clone este repositório:

git clone [https://github.com/arthurfelipe27/meu_tcc.git](https://github.com/arthurfelipe27/meu_tcc.git)  
cd agendasus-api  


2. Configure o Banco de Dados:

- Crie um novo banco de dados (schema) no seu servidor MySQL. O nome padrão no projeto é agendasus.
- Abra o arquivo src/main/resources/application.properties.
- Atualize as seguintes linhas com suas credenciais do MySQL:
````
spring.datasource.url=jdbc:mysql://localhost:3306/agendasus?useSSL=false&serverTimezone=UTC
spring.datasource.username=seu_usuario_mysql
spring.datasource.password=sua_senha_mysql
````

3. Execute o Backend (Spring Boot):
- Você pode executar a aplicação através da sua IDE (Eclipse, IntelliJ, VS Code) localizando a classe AgendasusApiApplication.java e executando-a.
- Alternativamente, use o Maven pelo terminal:
``mvn spring-boot:run``  
- O servidor backend estará rodando em http://localhost:8080.  

4. Acesse o Frontend:
Abra seu navegador e acesse a tela de login: [http://localhost:8080/login.html](http://localhost:8080/login.html)

## 📁 Estrutura de Pastas

O projeto segue uma arquitetura monolítica com o frontend servido estaticamente pelo backend Spring.

📦 agendasus-api/  
├── .mvn/  
├── src/  
│   ├── main/  
│   │   ├── java/br/com/tcc/agendasus/  
│   │   │   ├── config/       (Configuração de Segurança, CORS, Exceptions)  
│   │   │   ├── controller/   (Endpoints REST da API)  
│   │   │   ├── dto/          (Data Transfer Objects para a API)  
│   │   │   ├── model/        (Entidades JPA e Enums)  
│   │   │   ├── repository/   (Interfaces Spring Data JPA)  
│   │   │   └── service/      (Lógica de Negócios, Segurança)  
│   │   └── resources/  
│   │       ├── static/       (Frontend: HTML, CSS, JS)  
│   │       │   ├── css/  
│   │       │   ├── js/         (lógica do paciente, médico, diretor)  
│   │       │   └── *.html      (Telas de login, dashboards, etc.)  
│   │       └── application.properties (Configuração do Spring)  
│   └── test/                 (Testes unitários/integração)  
└── pom.xml                   (Dependências do Maven)  


## ✨ Funcionalidades Principais

### 🔐 Autenticação e Segurança
- Sistema de login com JWT (JSON Web Token).
- Rotas da API protegidas por role (PACIENTE, MEDICO, DIRETOR) usando Spring Security.
- Funcionalidade de "Esqueci minha senha" com token de redefinição (simulado).
- Tratamento global de exceções e erros de validação.

### 👤 Portal do Paciente
- Cadastro de novos pacientes.
- Dashboard para visualizar e filtrar médicos por especialidade ou unidade.
- Sistema de agendamento em horários disponíveis.
- Visualização de agendamentos futuros e histórico de consultas.
- Possibilidade de cancelar agendamentos.
- Acesso ao prontuário pós-consulta (prescrições, atestados, exames solicitados).
- Edição do próprio perfil (telefone, endereço).

### 🩺 Portal do Médico
- Dashboard com a agenda de consultas do dia.
- Visualização do histórico de atendimentos.
- Tela de atendimento para preenchimento do prontuário (evolução, sintomas, etc.).
- Geração de prescrições, atestados e solicitação de exames ao finalizar a consulta.
- Gerenciamento dos próprios horários de disponibilidade (dias da semana e horas).
- Criação de artigos e notícias (que aguardam aprovação).

### 📊 Portal do Diretor (Admin)
- Dashboard para gerenciamento completo do sistema.
- Gerenciamento de Unidades de Saúde: Cadastro de novas unidades.
- Gerenciamento de Médicos: Cadastro de novos médicos e associação a unidades.
- Gerenciamento de Usuários: Ativação e desativação de contas de usuários (pacientes e médicos).
- Moderação de Conteúdo: Aprovação ou exclusão de artigos criados por médicos.

## 🔧 Tecnologias Utilizadas

### ☁️ Backend
- Java 17
- spring Boot (v3.4.9 no pom.xml)
- Spring Security (Autenticação JWT)
- Spring Data JPA (Persistência de dados)
- Maven (Gerenciador de dependências)

### 🗄️ Banco de Dados
- MySQL (Banco de dados principal de desenvolvimento)
- (O pom.xml também inclui a dependência do PostgreSQL, indicando prontidão para produção)

### 🖥️ Frontend
- HTML5
- CSS3 (Estilização pura, sem frameworks)
- JavaScript (ES6+) (Vanilla JS para manipulação do DOM e chamadas fetch para a API)

## 📌 Status do Projeto
O projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e encontra-se concluído em seu escopo principal.

## 🧑‍💻 Autor
Desenvolvido por Arthur Felipe.  
[LinkedIn](www.linkedin.com/in/arthurfelipedasilvamatos)
[GitHub](https://github.com/ArthurFelipe27/ArthurFelipe27)  

## 📜 Licença
Este projeto é distribuído sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

*"A tecnologia a serviço da saúde, simplificando o acesso e melhorando o cuidado."*
