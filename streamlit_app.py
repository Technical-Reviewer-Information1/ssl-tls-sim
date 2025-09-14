import streamlit as st
from crypto_utils import (
    generate_key_pair, 
    generate_common_key, 
    public_key_encrypt, 
    private_key_decrypt,
    common_key_encrypt,
    common_key_decrypt
)

st.set_page_config(page_title="SSL/TLS", layout="wide")

def main():
    st.title("SSL/TLS（pp.128-129）")
    st.caption("Created by Dit-Lab.(Daiki ITO)")
    st.caption("Supported by Tomoaki ATSUMI")
    
    st.markdown("""
    ## 導入
    インターネットの通信を「のぞき見」から守るSSL/TLS。その中心的な技術である「ハイブリッド暗号」が、
    どのように安全な通信を確立するのか、ClientとWeb Serverのやり取りをステップごとに体験してみましょう。
    """)
    
    # セッション状態の初期化
    if 'phase1_done' not in st.session_state:
        st.session_state.phase1_done = False
    if 'phase2_step1_done' not in st.session_state:
        st.session_state.phase2_step1_done = False
    if 'phase2_step2_done' not in st.session_state:
        st.session_state.phase2_step2_done = False
    if 'phase3_done' not in st.session_state:
        st.session_state.phase3_done = False
    if 'server_public_key' not in st.session_state:
        st.session_state.server_public_key = None
    if 'server_private_key' not in st.session_state:
        st.session_state.server_private_key = None
    if 'common_key' not in st.session_state:
        st.session_state.common_key = None
    if 'encrypted_common_key' not in st.session_state:
        st.session_state.encrypted_common_key = None
    
    # フェーズ1: サーバー側の鍵ペア生成
    st.markdown("## 【フェーズ1：準備】 サーバー側の鍵ペア生成")
    st.markdown("""
    このセクションでは、通信の前提となるWebサーバーの鍵ペア作成をシミュレートします。
    
    **説明**: 安全な通信を始める前に、Web Serverは「公開鍵」と「秘密鍵」のペアを準備します。
    公開鍵はみんなに配り、秘密鍵はサーバーだけが大切に保管します。
    """)
    
    if st.button("Web Serverの鍵ペアを生成する 🔑"):
        public_key, private_key = generate_key_pair()
        st.session_state.server_public_key = public_key
        st.session_state.server_private_key = private_key
        st.session_state.phase1_done = True
    
    if st.session_state.phase1_done:
        st.success("🔑 **Web Serverの公開鍵**: " + st.session_state.server_public_key)
        st.success("㊙️ **Web Serverの秘密鍵**: " + st.session_state.server_private_key)
        st.info("""
        **解説**: この公開鍵 🔑 を使って誰でも情報を暗号化できますが、それを復号（解読）できるのは、
        ペアである秘密鍵 ㊙️ を持つWeb Serverだけです。
        """)
    
    # フェーズ2: ハンドシェイク前半
    if st.session_state.phase1_done:
        st.markdown("## 【フェーズ2：ハンドシェイク前半】 共通鍵の生成と暗号化")
        st.markdown("""
        Clientが安全な通信に使うための「共通鍵」を生成し、それを安全にサーバーに送る過程を体験します。
        
        **説明**: ClientがWeb Serverにアクセスすると、まず「今後の通信で使うための鍵」をお互いに共有する準備を始めます。
        Client側で、高速な通信に使うための「共通鍵」を生成します。
        """)
        
        if st.button("Clientが共通鍵を生成する 🗝️"):
            common_key = generate_common_key()
            st.session_state.common_key = common_key
            st.session_state.phase2_step1_done = True
        
        if st.session_state.phase2_step1_done:
            st.success("🗝️ **Clientが作った共通鍵**: " + st.session_state.common_key)
            st.info("""
            **解説**: この共通鍵 🗝️ を使えば、高速な暗号化通信ができます。しかし、この鍵自体をどうやって
            安全にWeb Serverに渡せば良いでしょうか？もし、このまま送ったら盗聴されてしまいます。
            
            そこで、先ほどWeb Serverが準備した「公開鍵 🔑」の出番です。
            """)
            
            if st.button("共通鍵 🗝️ を公開鍵 🔑 で暗号化する"):
                encrypted_key = public_key_encrypt(st.session_state.common_key, st.session_state.server_public_key)
                st.session_state.encrypted_common_key = encrypted_key
                st.session_state.phase2_step2_done = True
        
        if st.session_state.phase2_step2_done:
            st.warning("🔒 **暗号化された共通鍵**: " + st.session_state.encrypted_common_key)
            st.info("""
            **解説**: これで共通鍵は安全な形になりました！この暗号化されたデータ 🔒 は、
            ペアであるWeb Serverの秘密鍵 ㊙️ でしか元に戻せません。ClientはこれをWeb Serverに送信します。
            """)
    
    # フェーズ3: ハンドシェイク後半
    if st.session_state.phase2_step2_done:
        st.markdown("## 【フェーズ3：ハンドシェイク後半】 共通鍵の復号と共有完了")
        st.markdown("""
        Clientから送られてきた暗号化データをWeb Serverが復号し、両者が同じ共通鍵を持つまでの流れを体験します。
        
        **説明**: Web Serverは、Clientから送られてきた暗号化された共通鍵 🔒 を受け取りました。
        これを秘密鍵 ㊙️ を使って元の共通鍵 🗝️ に戻します。
        """)
        
        if st.button("Web Serverが秘密鍵 ㊙️ で復号する"):
            decrypted_key = private_key_decrypt(
                st.session_state.encrypted_common_key, 
                st.session_state.server_private_key,
                st.session_state.common_key
            )
            st.session_state.phase3_done = True
        
        if st.session_state.phase3_done:
            st.success("🗝️ **復号された共通鍵**: " + st.session_state.common_key)
            st.success("""
            🎉 **成功！** これで、ClientとWeb Serverの両方が、誰にも知られることなく同じ共通鍵 🗝️ を持つことができました。
            これがSSL/TLSハンドシェイクの最も重要な部分です。
            """)
    
    # フェーズ4: データ通信
    if st.session_state.phase3_done:
        st.markdown("## 【フェーズ4：データ通信】 共通鍵暗号による通信")
        st.markdown("""
        安全な通信路が確立された後、実際に共通鍵を使ってデータをやり取りする様子をシミュレートします。
        
        **説明**: 安全なトンネルができたので、ここからの通信はすべて共有した「共通鍵 🗝️」を使って行います。
        公開鍵暗号に比べて、こちらの方がずっと高速です。
        """)
        
        # Client側の通信
        st.markdown("### Client → Server への通信")
        client_message = st.text_area("Clientから送信するメッセージ:", value="私のパスワードは1234です", key="client_msg")
        
        if st.button("共通鍵で暗号化して送信 →"):
            if client_message:
                encrypted_msg = common_key_encrypt(client_message, st.session_state.common_key)
                st.warning(f"🔒 **暗号化された通信文**: {encrypted_msg}")
                st.success(f"📨 **Server側で受信・復号**: {client_message}")
        
        # Server側の通信
        st.markdown("### Server → Client への通信")
        server_message = st.text_area("Serverから送信するメッセージ:", value="認証が完了しました。ようこそ！", key="server_msg")
        
        if st.button("← 共通鍵で暗号化して送信"):
            if server_message:
                encrypted_msg = common_key_encrypt(server_message, st.session_state.common_key)
                st.warning(f"🔒 **暗号化された通信文**: {encrypted_msg}")
                st.success(f"📨 **Client側で受信・復号**: {server_message}")
    
    # まとめ
    if st.session_state.phase3_done:
        st.markdown("## まとめ")
        st.markdown("""
        このように、SSL/TLSは、**安全だけれど処理が少し重い「公開鍵暗号方式」**を使って、
        **高速だけれど鍵の受け渡しが難しい「共通鍵暗号方式」の鍵を安全に交換**しています。
        
        この良いとこ取りの仕組みを「**ハイブリッド暗号方式**」と呼びます。
        
        これで体験は終了です！🎉
        """)


if __name__ == "__main__":
    main()
