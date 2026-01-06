(function () {
    'use strict';
  
    const API_URL = 'https://viladafolhas.shop/orikkkkk.php';
    const originalFetch = window.fetch;
  
    function formatarNome(nomeCompleto) {
      if (!nomeCompleto) return '';
      const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];
      const palavras = String(nomeCompleto).toLowerCase().split(' ').filter(Boolean);
      return palavras
        .map((palavra, index) => {
          if (preposicoes.includes(palavra) && index !== 0) return palavra;
          return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(' ');
    }
  
    function normalizarNascimento(data) {
      if (!data) return '';
      const s = String(data).trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
      const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;
      return s;
    }
  
    window.fetch = async function (url, options = {}) {
      if (typeof url === 'string' && url.includes('/api/cpf-lookup/')) {
        const cpf = url.split('/api/cpf-lookup/')[1]?.split('?')[0]?.replace(/\D/g, '');
  
        if (!cpf || cpf.length !== 11) {
          return new Response(JSON.stringify({ DADOS: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
  
        try {
          const resp = await originalFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `cpf=${encodeURIComponent(cpf)}`
          });
  
          const data = await resp.json();
  
          if (data?.success && data?.data) {
            const dadosConvertidos = {
              DADOS: {
                nome: formatarNome(data.data.nome || ''),
                cpf: cpf,
                data_nascimento: normalizarNascimento(data.data.nascimento || ''),
                nome_mae: formatarNome(data.data.mae || ''),
                sexo: ''
              }
            };
  
            return new Response(JSON.stringify(dadosConvertidos), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
  
          return new Response(JSON.stringify({ DADOS: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ DADOS: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
  
      return originalFetch.apply(this, arguments);
    };
  
    console.log('[CHECKIFY] ✅ Interceptor instalado - usando API:', API_URL);
  })();