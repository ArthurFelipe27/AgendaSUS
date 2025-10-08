# Fase 1: Construção (Build)
# Usamos uma imagem oficial do Maven com Java 17 para compilar o projeto.
FROM maven:3.8.5-openjdk-17 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição do Maven e baixa as dependências
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o resto do código fonte e compila o projeto
COPY src ./src
RUN mvn clean package -DskipTests

# Fase 2: Execução (Runtime)
# Usamos uma imagem leve, apenas com o Java 17 necessário para rodar.
FROM eclipse-temurin:17-jre-jammy

# Define o diretório de trabalho
WORKDIR /app

# Copia o arquivo .jar compilado da fase de construção
COPY --from=build /app/target/agendasus-api-0.0.1-SNAPSHOT.jar .

# Expõe a porta que o Spring Boot usa por padrão
EXPOSE 8080

# Comando para iniciar a aplicação quando o container for executado
ENTRYPOINT ["java", "-jar", "agendasus-api-0.0.1-SNAPSHOT.jar"]
