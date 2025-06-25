# Weather Forecast App 🌤️

Um aplicativo React Native de previsão do tempo que permite buscar cidades e salvá-las como favoritas para fácil acesso aos dados meteorológicos.

## 📱 Funcionalidades

- **Busca de Cidades**: Pesquise cidades ao redor do mundo usando a API do OpenStreetMap Nominatim
- **Favoritos**: Salve suas cidades favoritas localmente para acesso rápido
- **Controle de Atualização**: 
  - Timestamp da última atualização visível em cada cidade
  - Atualização individual disponível após 5 minutos
  - Botão de atualização aparece quando disponível
  - Atualização forçada via "puxar para baixo"
- **Dados Meteorológicos**: Visualize informações como:
  - Temperatura atual
  - Umidade relativa
  - Probabilidade de chuva
  - Previsão horária (próximas 24 horas)
  - Previsão diária (próximos 7 dias)
- **Interface Intuitiva**: Design moderno e fácil de usar
- **Configurações**: Gerencie favoritos e cache de dados

## 🛠️ Tecnologias Utilizadas

- **React Native** com Expo
- **TypeScript** para tipagem estática
- **AsyncStorage** para armazenamento local
- **APIs Públicas**:
  - [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) - Busca de cidades
  - [Open-Meteo](https://api.open-meteo.com/) - Dados meteorológicos

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm start
   ```

3. **Executar no dispositivo**:
   - Para Android: `npm run android`
   - Para iOS: `npm run ios`
   - Para Web: `npm run web`

## 📂 Estrutura do Projeto

```
├── app/                    # Telas principais
│   ├── (tabs)/            # Navegação por abas
│   │   ├── index.tsx      # Tela principal do tempo
│   │   └── two.tsx        # Tela de configurações
├── components/            # Componentes reutilizáveis
│   ├── WeatherCard.tsx    # Card de exibição do tempo
│   ├── CitySearch.tsx     # Componente de busca
│   └── WeatherDetail.tsx  # Tela detalhada do tempo
├── services/              # Serviços e APIs
│   ├── WeatherService.ts  # Integração com APIs meteorológicas
│   └── FavoritesService.ts # Gerenciamento de favoritos
├── types/                 # Definições de tipos TypeScript
│   └── weather.ts         # Tipos relacionados ao tempo
```

## 🌟 Recursos Principais

### Busca de Cidades
- Digite o nome de uma cidade para encontrar localizações em todo o mundo
- Visualize detalhes como nome completo e país
- Adicione cidades aos favoritos com um toque

### Visualização do Tempo
- **Card compacto**: Temperatura, umidade e precipitação
- **Tela detalhada**: Previsão completa com gráficos horários e diários
- **Ícones contextuais inteligentes**: 
  - ☀️ Sol durante o dia (6h-18h)
  - 🌙 Lua durante a noite (18h-6h)
  - ⛅ Nuvens claras durante o dia / ☁️ Nuvens escuras à noite
  - 🌧️ Chuva (sem sol no ícone, mesmo durante o dia)
  - ❄️ Neve, 🌫️ Neblina, ⛈️ Tempestades
- **Controles de atualização discretos**:
  - Botão 🔄 ao lado do timestamp "Atualizado: X min atrás"
  - Na tela detalhada: informações discretas abaixo do nome da cidade
  - Disponível apenas quando atualização está disponível (após 5 minutos)

### Gerenciamento de Favoritos
- Armazenamento local seguro
- Adição/remoção fácil de cidades
- Controle inteligente de atualização com timestamps
- Atualização individual por cidade (disponível a cada 5 minutos)
- Indicador visual quando atualização está disponível
- Timestamps atualizados automaticamente a cada 30 segundos

## 🔧 Configuração

O aplicativo não requer configuração adicional. Todas as APIs utilizadas são públicas e gratuitas.

## 📱 Screenshots

O aplicativo possui:
- Tela principal com lista de cidades favoritas
- Modal de busca de novas cidades
- Tela detalhada com previsão completa
- Tela de configurações

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [OpenStreetMap](https://www.openstreetmap.org/) pelos dados de localização
- [Open-Meteo](https://open-meteo.com/) pelos dados meteorológicos gratuitos
- [Expo](https://expo.dev/) pela excelente plataforma de desenvolvimento
