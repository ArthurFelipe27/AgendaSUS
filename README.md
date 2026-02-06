# 🚀 AgendaSUS – Sistema de Agendamento de Consultas

![GitHub repo size](https://img.shields.io/github/repo-size/ArthurFelipe27/AgendaSUS?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/ArthurFelipe27/AgendaSUS?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/ArthurFelipe27/AgendaSUS?style=for-the-badge)
![License](https://img.shields.io/github/license/ArthurFelipe27/AgendaSUS?style=for-the-badge)

> **AgendaSUS** é um sistema **full-stack** de agendamento e gerenciamento de consultas online, simulando um ambiente do **Sistema Único de Saúde (SUS)**. Desenvolvido com **Java e Spring Boot** no backend e **HTML, CSS e JavaScript** no frontend, o sistema oferece múltiplos portais com níveis de acesso distintos.

---

## ✨ Funcionalidades Principais

O sistema é dividido em **três portais**, cada um com responsabilidades específicas:

* 👤 **Portal do Paciente**  
  Focado no agendamento de consultas, acompanhamento do histórico médico e acesso ao prontuário.

* 🩺 **Portal do Médico**  
  Gerenciamento da agenda, atendimentos, prontuários e criação de conteúdos informativos.

* 📊 **Portal do Diretor (Admin)**  
  Administração geral do sistema, unidades de saúde, usuários e moderação de conteúdo.

---

## 🔐 Autenticação e Segurança

* Login com **JWT (JSON Web Token)**
* Controle de acesso por **roles** (PACIENTE, MEDICO, DIRETOR)
* Rotas protegidas com **Spring Security**
* Funcionalidade de **recuperação de senha** (simulada)
* Tratamento global de exceções e validações

---

## 👤 Portal do Paciente

* Cadastro de novos pacientes
* Dashboard com listagem e filtro de médicos (especialidade/unidade)
* Agendamento em horários disponíveis
* Visualização de consultas futuras e histórico
* Cancelamento de agendamentos
* Acesso ao prontuário pós-consulta (prescrições, atestados e exames)
* Edição do próprio perfil

---

## 🩺 Portal do Médico

* Dashboard com agenda diária
* Histórico de atendimentos
* Tela de atendimento com preenchimento de prontuário
* Geração de prescrições, atestados e solicitação de exames
* Gerenciamento da própria disponibilidade
* Criação de artigos e notícias (sujeitos à aprovação)

---

## 📊 Portal do Diretor (Admin)

* Dashboard administrativo completo
* Gerenciamento de Unidades de Saúde
* Cadastro e associação de médicos às unidades
* Ativação e desativação de usuários
* Moderação de conteúdos criados por médicos

---

## 💻 Pré-requisitos

Antes de executar o projeto, certifique-se de ter:

* ☕ **Java JDK 17 ou superior**
* 🧰 **Maven**
* 🐬 **MySQL** em execução local
* 💻 Sistema operacional **Windows, Linux ou macOS**

---

## 🚀 Tecnologias Utilizadas

### ☁️ Backend

* ☕ **Java 17**
* ⚙️ **Spring Boot 3**
* 🔐 **Spring Security** — Autenticação JWT
* 🗄️ **Spring Data JPA** — Persistência de dados
* 🧰 **Maven** — Build e dependências

### 🗃️ Banco de Dados

* 🐬 **MySQL** — Banco principal de desenvolvimento
* 🐘 **PostgreSQL** — Dependência incluída para produção

### 🖥️ Frontend

* 🧱 **HTML5**
* 💅 **CSS3** — Estilização pura (sem frameworks)
* ⚡ **JavaScript (ES6+)** — Vanilla JS e chamadas `fetch`

---

## ⚙️ Como Executar o Projeto

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/ArthurFelipe27/AgendaSUS.git
cd agendasus-api
```

---

### 2️⃣ Configure o Banco de Dados

Crie o banco no MySQL:

```sql
CREATE DATABASE agendasus;
```

Configure o arquivo `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agendasus?useSSL=false&serverTimezone=UTC
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

---

### 3️⃣ Execute o Backend

```bash
mvn spring-boot:run
```

Ou execute pela IDE a classe:

```
AgendasusApiApplication.java
```

O backend estará disponível em:  
👉 http://localhost:8080

---

### 4️⃣ Acesse o Frontend

Abra o navegador e acesse:

👉 http://localhost:8080/login.html

---

## 📂 Estrutura de Pastas

```text
agendasus-api/
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/br/com/tcc/agendasus/
│   │   │   ├── config/        # Segurança, CORS e Exceptions
│   │   │   ├── controller/    # Endpoints REST
│   │   │   ├── dto/           # DTOs da aplicação
│   │   │   ├── model/         # Entidades JPA e Enums
│   │   │   ├── repository/    # Repositórios JPA
│   │   │   └── service/       # Lógica de negócio
│   │   └── resources/
│   │       ├── static/        # Frontend (HTML, CSS, JS)
│   │       │   ├── css/
│   │       │   ├── js/        # Lógica paciente, médico e diretor
│   │       │   └── *.html     # Telas do sistema
│   │       └── application.properties
│   └── test/                  # Testes
└── pom.xml                    # Dependências Maven
```

---

## 📸 Demonstração

### Tela de Login

<img width="1920" height="1080" alt="Tela de Login" src="https://github.com/user-attachments/assets/5e3bdb0c-cfac-4b93-a682-5d1f85371c15" />

### Agendamento (Paciente)

<img width="1875" height="965" alt="Agendamento Paciente" src="https://github.com/user-attachments/assets/d61abf2a-3ae3-4d67-bbb6-56652d7adba5" />
<img width="1758" height="942" alt="Agendamento Paciente" src="https://github.com/user-attachments/assets/ae4b53c6-a89b-484a-94d6-e70d92044bca" />
<img width="1692" height="941" alt="Agendamento Paciente" src="https://github.com/user-attachments/assets/10a7331f-8a7d-41ee-86e6-afda15addcaa" />

### Atendimento (Médico)

<img width="1767" height="933" alt="Atendimento Médico" src="https://github.com/user-attachments/assets/0ef55f96-4dee-4b60-aad4-e068b7756ad8" />
<img width="1751" height="964" alt="Atendimento Médico" src="https://github.com/user-attachments/assets/61f5508a-1413-4aa1-b0af-f47d6db2fce1" />

---

## 📌 Status do Projeto

Projeto desenvolvido como **Trabalho de Conclusão de Curso (TCC)** e concluído dentro do escopo proposto.

---

## 🧑‍💻 Autor

**Arthur Felipe**  
🔗 LinkedIn: https://www.linkedin.com/in/arthurfelipedasilvamatos  
🌐 GitHub: https://github.com/ArthurFelipe27  

---

## 📝 Licença

Este projeto está licenciado sob a **Licença MIT**.  
Consulte o arquivo `LICENSE` para mais detalhes.

---

💡 *A tecnologia a serviço da saúde, simplificando o acesso e melhorando o cuidado.*
