using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using ConsoleApp;
namespace CordovaGenerator
{
    public partial class mainFrm : Form
    {
        private const string DefaultUrlForAddedTabs = "https://www.google.com";
        // Default to a small increment:
        private const double ZoomIncrement = 0.10;
        private bool multiThreadedMessageLoopEnabled;
        #region Form
        public mainFrm(bool multiThreadedMessageLoopEnabled)
        {
            InitializeComponent();
            //menuStrip1.BackColor = this.BackColor;
            var bitness = Environment.Is64BitProcess ? "x64" : "x86";
            Text = "CefSharp.WinForms.Example - " + bitness;
            WindowState = FormWindowState.Maximized;
            //Only perform layout when control has completly finished resizing
            ResizeBegin += (s, e) => SuspendLayout();
            ResizeEnd += (s, e) => ResumeLayout(true);
            this.multiThreadedMessageLoopEnabled = multiThreadedMessageLoopEnabled;
            //string page = string.Format(@"{0}\html-resources\starter.html", Application.StartupPath);
            string page = string.Format(@"{0}\html-resources\starter.html", Application.StartupPath);
            // "http://localhost:4400/starter.html?enableripple=cordova-3.0.0-NexusGalaxy"
            if (!File.Exists(page))
            {
                MessageBox.Show("Error The html file doesn't exists : " + page);
                page = "https://www.google.com";
            }
            AddTab("https://www.google.com/intl/en/about/");
        }
        private void Form1_Load(object sender, EventArgs e)
        {
            appendConsoleTextDelegate = new AppendConsoleText(outputBox_AppendConsoleText);
            updatePromptTextDelegate = new UpdatePromptText(labelPrompt_UpdatePromptText);
            customVisualise();
            listDirectory(treeView1, string.Format(@"{0}\html-resources", Application.StartupPath));
            //processStart();
            ConsoleApp.Program.Main();
        }
        private void customVisualise()
        {
            tabControl.SizeMode = TabSizeMode.Fixed;
            tabControl.ItemSize = new Size(65, 20);
        }
        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing
                || e.CloseReason == CloseReason.TaskManagerClosing
                || e.CloseReason == CloseReason.ApplicationExitCall
                || e.CloseReason == CloseReason.None)
            {
                if (MessageBox.Show("Are you sure you want to exit", "Exit", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.Yes)
                {
                    processKill();
                    System.Diagnostics.Process.GetCurrentProcess().Kill();
                }
                e.Cancel = true;
            }
        }
        private void listDirectory(TreeView treeView, string path)
        {
            treeView.Nodes.Clear();
            var rootDirectoryInfo = new DirectoryInfo(path);
            treeView.Nodes.Add(CreateDirectoryNode(rootDirectoryInfo));
            treeView1.TopNode.Text = "File Explorer";
            treeView1.TopNode.Expand();
        }
        private static TreeNode CreateDirectoryNode(DirectoryInfo directoryInfo)
        {
            var directoryNode = new TreeNode(directoryInfo.Name);
            foreach (var directory in directoryInfo.GetDirectories())
                directoryNode.Nodes.Add(CreateDirectoryNode(directory));
            foreach (var file in directoryInfo.GetFiles())
                directoryNode.Nodes.Add(new TreeNode(file.Name));
            return directoryNode;
        }
        #endregion
        private void AddTab(string url, int? insertIndex = null)
        {
            var browser = new cgBrowserUserControl(AddTab, url, multiThreadedMessageLoopEnabled)
            {
                Dock = DockStyle.Fill,
            };
            //This call isn't required for the sample to work.
            //It's sole purpose is to demonstrate that #553 has been resolved.
            browser.CreateControl();
            panel5.Controls.Add(browser);
        }
        private void cgButtonToolbox_Click(object sender, EventArgs e)
        {
            cgToolbox.Visible = !cgToolbox.Visible;
        }
        private void cgButtonExplorer_Click(object sender, EventArgs e)
        {
            cgExplorer.Visible = !cgExplorer.Visible;
        }
        private void toolStripButton1_Click(object sender, EventArgs e)
        {
            Run("/ C dir");
        }
        #region CMD
        private Process process;
        private readonly string m_programPath = "cmd.exe";
        private readonly string m_logPath = string.Format(@"{0}\logs\log.txt", Application.StartupPath);
        public delegate void AppendConsoleText(string text);
        public AppendConsoleText appendConsoleTextDelegate;
        public delegate void UpdatePromptText(string text);
        public UpdatePromptText updatePromptTextDelegate;
        private void processStart()
        {
            //using (process = new Process())
            {
                process = new Process();
                //process.StartInfo.FileName = Path.Combine(Environment.SystemDirectory, "cmd.exe");
                process.StartInfo =
                            new ProcessStartInfo(m_programPath)
                            {
                                RedirectStandardInput = true,
                                RedirectStandardOutput = true,
                                UseShellExecute = false,
                                RedirectStandardError = true,
                                //WorkingDirectory = @"C:\",
                                //Arguments = command,
                                CreateNoWindow = true
                            };
                process.OutputDataReceived += new DataReceivedEventHandler(process_OutputDataReceived);
                process.ErrorDataReceived += new DataReceivedEventHandler(process_ErrorDataReceived);
                process.Exited += new EventHandler(process_Exited);
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
            }
        }
        private void processKill()
        {
            if (process != null)
            {
                process.Kill();
            }
        }
        public void Run(string command)
        {
            process.StandardInput.WriteLine(command);
            if (command.Length == 2 && Char.IsLetter(command[0]) && command[1] == ':')
            {
                labelPrompt_UpdatePromptText(command.ToUpper());
            }
        }
        private void process_OutputDataReceived(object sendingProcess, DataReceivedEventArgs outLine)
        {
            process_write(outLine);
        }
        private void process_ErrorDataReceived(object sendingProcess, DataReceivedEventArgs outLine)
        {
            process_write(outLine);
        }
        private void process_write(DataReceivedEventArgs outLine)
        {
            if (outLine.Data != null)
            {
                Invoke(appendConsoleTextDelegate, new object[] { outLine.Data });
            }
        }
        private void process_Exited(object sender, EventArgs e)
        {
            processKill();
        }
        private void outputBox_AppendConsoleText(string text)
        {
            if (!string.IsNullOrWhiteSpace(text))
            {
                outputBox.AppendText(string.Format("{0}\r\n", text));
                outputBox.SelectionStart = outputBox.Text.Length;
                outputBox.ScrollToCaret();
            }
        }
        private void labelPrompt_UpdatePromptText(string text)
        {
            labelPrompt.Text = text + @"\>";
        }
        #endregion
        private void button5_Click(object sender, EventArgs e)
        {
            textBoxConsoleSearch.Text = string.Empty;
            outputBox.Text = string.Empty;
        }
        private void consoleSearch(string keyword)
        {
            //outputBox.GetLineFromCharIndex(outputBox.Find(keyword))
            //Select the line from it's number
            int startIndex = outputBox.Find(keyword);
            if (startIndex > -1)
            {
                outputBox.Select(startIndex, keyword.Length);
                //Set the selected text fore and background color
                outputBox.SelectionColor = System.Drawing.Color.White;
                outputBox.SelectionBackColor = System.Drawing.Color.Blue;
                outputBox.SelectionStart = startIndex;
                outputBox.ScrollToCaret();
            }
        }
        private void textBoxConsoleSearch_KeyUp(object sender, KeyEventArgs e)
        {
            string keyword = textBoxConsoleSearch.Text;
            if (e.KeyCode == Keys.Enter && !string.IsNullOrWhiteSpace(keyword) && !string.IsNullOrWhiteSpace(outputBox.Text))
            {
                consoleSearch(textBoxConsoleSearch.Text);
            }
        }
        private void textBoxCommand_KeyUp(object sender, KeyEventArgs e)
        {
            string command = textBoxCommand.Text;
            if ((e.KeyCode == Keys.Enter && !string.IsNullOrWhiteSpace(command)))
            {
                ConsoleApp.Program.Run(command.ToLower().Trim());
                textBoxCommand.Clear();
            }
        }
        private void textBoxCommand_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Control && e.KeyCode == Keys.C)
            {
                processKill();
                //process.Start();
                textBoxCommand.Clear();
            }
        }
        private void tabControl_DrawItem(object sender, DrawItemEventArgs e)
        {
            if (e.Index == 1)
            {
                //This code will render a "x" mark at the end of the Tab caption.
                e.Graphics.DrawString("X", new Font("Courier New", 9), Brushes.Black, e.Bounds.Right - 15, e.Bounds.Top + 4);
                e.Graphics.DrawString(tabControl.TabPages[e.Index].Text, e.Font, Brushes.Black, e.Bounds.Left + 12, e.Bounds.Top + 4);
                e.DrawFocusRectangle();
            }
            else
            {
                e.Graphics.DrawString(tabControl.TabPages[e.Index].Text, e.Font, Brushes.Black, e.Bounds.Left + 12, e.Bounds.Top + 4);
                e.DrawFocusRectangle();
            }
        }
        private void treeView1_NodeMouseDoubleClick(object sender, TreeNodeMouseClickEventArgs e)
        {
            string path = string.Format(@"{0}\html-resources", Application.StartupPath);
            try
            {
                if (!treeView1.SelectedNode.Text.Equals("File Explorer"))
                {
                    string fullPath = treeView1.SelectedNode.FullPath.Substring(13);
                    path += fullPath;
                    if (File.Exists(path))
                    {
                        string content = File.ReadAllText(path);
                        richTextBox1.Text = content;
                        tabControl.SelectedIndex = 1;
                    }
                    //foreach (var file in new DirectoryInfo(path).GetFiles())
                    //{
                    //    outputBox.Text += file + Environment.NewLine;
                    //}
                }
            }
            catch (Exception ex) { outputBox.Text += ex.Message + Environment.NewLine; }
        }
        private void tabControl_MouseDown(object sender, MouseEventArgs e)
        {
            //Looping through the controls.
            for (int i = 0; i < tabControl.TabPages.Count; i++)
            {
                Rectangle r = tabControl.GetTabRect(i);
                //Getting the position of the "x" mark.
                Rectangle closeButton = new Rectangle(r.Right - 15, r.Top + 4, 9, 7);
                if (closeButton.Contains(e.Location))
                {
                    if (tabControl.SelectedIndex == 1)
                        if (MessageBox.Show("Would you like to Close this Tab?", "Confirm", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
                        {
                            tabControl.TabPages.RemoveAt(i);
                            break;
                        }
                }
            }
        }
    }
}
